from flask import Flask, jsonify, request
import joblib
import numpy as np

app = Flask(__name__)
model = joblib.load("recommendation_model.pkl")

df = model["df"]
cosine_sim = model["cosine_sim"]

@app.route("/recommendPosts", methods=["GET"])
def recommend_posts():
    post_id = request.args.get("postId")
    if post_id not in df["_id"].values:
        return jsonify({"error": "Post not found"}), 404
    
    idx = df.index[df["_id"] == post_id][0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_indices = [i for i, s in sim_scores[1:6]]

    results = df.loc[top_indices, ["_id", "room.title", "room.price", "room.area", "room.address"]].to_dict(orient="records")
    return jsonify({"success": True, "data": results})

if __name__ == "__main__":
    app.run(port=6000)
