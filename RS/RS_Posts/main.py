from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})
model = joblib.load("recommendation_model.pkl")
print("Model loaded successfully.", model)
df = model["df"]
cosine_sim = model["cosine_sim"]

@app.route("/recommendPosts", methods=["GET"])
def recommend_posts():
    post_id = request.args.get("postId")
    try:
        top_k = int(request.args.get("topK", 5))
    except (TypeError, ValueError):
        top_k = 5
    top_k = max(1, min(top_k, 20))

    if post_id not in df["_id"].values:
        return jsonify({"success": False, "error": "Post not found"}), 404

    idx = df.index[df["_id"] == post_id][0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_indices = [i for i, s in sim_scores[1:top_k+1]]

    rows = df.loc[top_indices, ["_id", "roomId.title", "roomId.price", "roomId.area", "roomId.address", "roomId.images"]]

    # Chuẩn hoá output sang nested room
    results = []
    for _, row in rows.iterrows():
        results.append({
            "_id": row["_id"],
            "room": {
                "title": row["roomId.title"],
                "price": row["roomId.price"],
                "area": row["roomId.area"],
                "address": row["roomId.address"],
                "images": row["roomId.images"],
            }
        })

    return jsonify({"success": True, "data": results, "meta": {"topK": top_k}})

if __name__ == "__main__":
    app.run(port=5001)  # Đổi từ 6000 sang 5001 để tránh ERR_UNSAFE_PORT
