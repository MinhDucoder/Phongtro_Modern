from flask import Flask, jsonify, request
import joblib
import numpy as np
import threading
import time
import subprocess
import datetime
import os

app = Flask(__name__)

# === Load model ban đầu ===
def load_model():
    global model, df, cosine_sim
    model = joblib.load("recommendation_model.pkl")
    df = model["df"]
    cosine_sim = model["cosine_sim"]
    print("✅ Model loaded successfully.")

load_model()

# === Hàm retrain model định kỳ ===
def auto_update_model(interval_minutes=15):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # đường dẫn thư mục hiện tại
    script_path = os.path.join(BASE_DIR, "initModel.py")   # trỏ đúng file

    while True:
        try:
            print(f"🕒 Retraining model... ({datetime.datetime.now()})")
            subprocess.run(["python3", script_path], check=True)
            load_model()
            print(f"✅ Model updated successfully at {datetime.datetime.now()}")
        except Exception as e:
            print(f"❌ Error updating model: {e}")
        time.sleep(interval_minutes * 60)
# === Chạy luồng background khi server khởi động ===
threading.Thread(target=auto_update_model, args=(15,), daemon=True).start()

# === API recommend ===
@app.route("/recommendPosts", methods=["GET"])
def recommend_posts():
    post_id = request.args.get("postId")
    if post_id not in df["_id"].values:
        return jsonify({"error": "Post not found"}), 404

    idx = df.index[df["_id"] == post_id][0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_indices = [i for i, s in sim_scores[1:6]]

    results = df.loc[top_indices, [
        "_id", "room.title", "room.price", "room.area", "room.address", "room.images"
    ]].to_dict(orient="records")

    return jsonify({"success": True, "data": results})

if __name__ == "__main__":
    app.run(port=6000)
