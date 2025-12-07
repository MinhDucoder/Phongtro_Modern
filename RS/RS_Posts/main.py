from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import threading
import time
import subprocess
import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Đường dẫn tuyệt đối đến thư mục chứa script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "recommendation_model.pkl")

# === Load model ban đầu ===
def load_model():
    global model, df, cosine_sim
    try:
        model = joblib.load(MODEL_PATH)
        df = model["df"]
        cosine_sim = model["cosine_sim"]
        print("✅ Model loaded successfully.")
        print(f"   Total posts in model: {len(df)}")
    except FileNotFoundError:
        print("⚠️ Model file not found. Run initModel.py first to create the model.")
        raise
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise

# Load model khi start (nếu file tồn tại)
model = None
df = None
cosine_sim = None
try:
    load_model()
except Exception as e:
    print(f"⚠️ Could not load model: {e}")
    print("   Please run initModel.py to generate the model first.")
    print("   Server will still run but recommendations will not work.")

# === Hàm retrain model định kỳ ===
def auto_update_model(interval_minutes=15):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # đường dẫn thư mục hiện tại
    script_path = os.path.join(BASE_DIR, "initModel.py")   # trỏ đúng file
    
    # Sử dụng Python từ virtual environment
    if os.name == "nt":  # Windows
        python_cmd = os.path.join(BASE_DIR, "env", "Scripts", "python.exe")
    else:  # Linux/Mac
        python_cmd = os.path.join(BASE_DIR, "env", "bin", "python")
    
    # Nếu không tìm thấy Python trong venv, fallback về Python global
    if not os.path.exists(python_cmd):
        python_cmd = "python" if os.name == "nt" else "python3"
        print(f"⚠️ Virtual environment not found, using global Python: {python_cmd}")

    while True:
        try:
            print(f"🕒 Retraining model... ({datetime.datetime.now()})")
            subprocess.run([python_cmd, script_path], check=True, cwd=BASE_DIR)
            load_model()
            print(f"✅ Model updated successfully at {datetime.datetime.now()}")
        except Exception as e:
            print(f"❌ Error updating model: {e}")
        time.sleep(interval_minutes * 60)
# === Chạy luồng background khi server khởi động ===
threading.Thread(target=auto_update_model, args=(15,), daemon=True).start()

def get_images_list(images_value):
    """Convert images value to list format"""
    if isinstance(images_value, list):
        return images_value
    elif isinstance(images_value, str) and images_value.strip():
        # Nếu là string, split by space hoặc comma
        return [url.strip() for url in images_value.split() if url.strip().startswith('http')]
    return []

# === Health check ===
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None and df is not None and cosine_sim is not None,
        "total_posts": len(df) if df is not None else 0
    }), 200

# === API recommend ===
@app.route("/recommendPosts", methods=["GET"])
def recommend_posts():
    try:
        # Check if model is loaded
        if df is None or cosine_sim is None:
            return jsonify({"success": False, "error": "Model not loaded. Please run initModel.py first."}), 503
        
        post_id = request.args.get("postId")
        if not post_id:
            return jsonify({"success": False, "error": "postId is required"}), 400
        
        try:
            top_k = int(request.args.get("topK", 5))
        except (TypeError, ValueError):
            top_k = 5
        top_k = max(1, min(top_k, 20))

        # Nếu post không tồn tại trong model, trả về các posts ngẫu nhiên
        if post_id not in df["_id"].values:
            print(f"⚠️ Post {post_id} not found in model, returning random posts")
            # Lấy top_k posts ngẫu nhiên
            sample_df = df.sample(n=min(top_k, len(df)))
            results = []
            for _, row in sample_df.iterrows():
                results.append({
                    "_id": str(row.get("_id", "")),
                    "room": {
                        "title": row.get("roomId.title", "") or "",
                        "price": float(row.get("roomId.price", 0)) or 0,
                        "area": float(row.get("roomId.area", 0)) or 0,
                        "address": row.get("roomId.address", "") or "",
                        "images": get_images_list(row.get("roomId.images", [])),
                    }
                })
            return jsonify({"success": True, "data": results, "fallback": True})

        idx = df.index[df["_id"] == post_id][0]
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        top_indices = [i for i, s in sim_scores[1:top_k+1]]

        # Lấy các rows tương ứng
        recs = df.loc[top_indices]
        
        # Chuyển đổi sang format đúng (giống initModel.py)
        results = []
        for _, row in recs.iterrows():
            results.append({
                "_id": str(row.get("_id", "")),
                "room": {
                    "title": row.get("roomId.title", "") or "",
                    "price": float(row.get("roomId.price", 0)) or 0,
                    "area": float(row.get("roomId.area", 0)) or 0,
                    "address": row.get("roomId.address", "") or "",
                    "images": get_images_list(row.get("roomId.images", [])),
                }
            })

        return jsonify({"success": True, "data": results})
    except Exception as e:
        print(f"Error in recommend_posts: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    # Bind to 0.0.0.0 to allow connections from other processes/containers
    app.run(host='0.0.0.0', port=6000, debug=True)  # Chạy trên port 6000, accessible from all interfaces
