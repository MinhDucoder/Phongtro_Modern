import requests
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
import joblib  # để lưu model

# ====== GỌI API ======
url = "http://localhost:5000/api/v1/posts"
response = requests.get(url).json()
posts = response["data"]["items"]

df = pd.json_normalize(posts)

# ====== GHÉP TEXT FEATURES ======
def combine_features(row):
    text = (
        str(row.get("room.title", "")) + " " +
        str(row.get("room.description", "")) + " " +
        str(row.get("room.propertyType", "")) + " " +
        " ".join(row.get("room.amenities", [])) + " " +
        " ".join(row.get("options", [])) + " " +
        str(row.get("room.address", ""))
    )
    return text.lower()

df["content"] = df.apply(combine_features, axis=1)

# ====== TF-IDF ======
tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
tfidf_matrix = tfidf_vectorizer.fit_transform(df["content"])

# ====== CHUẨN HÓA GIÁ + DIỆN TÍCH ======
scaler = MinMaxScaler()
df["price_norm"] = scaler.fit_transform(df[["room.price"]].fillna(0))
df["area_norm"] = scaler.fit_transform(df[["room.area"]].fillna(0))

# ====== GHÉP LẠI THÀNH MA TRẬN CUỐI ======
numeric_features = np.stack([df["price_norm"], df["area_norm"]], axis=1)
# để ghép numeric (n_samples, 2) vào TF-IDF (n_samples, n_features_text)
from scipy.sparse import hstack
final_matrix = hstack([tfidf_matrix, numeric_features])

# ====== TÍNH COSINE ======
cosine_sim = cosine_similarity(final_matrix, final_matrix)

# ====== HÀM GỢI Ý ======
def recommend(post_id, top_k=5):
    idx = df.index[df["_id"] == post_id][0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    top_indices = [i for i, s in sim_scores[1:top_k+1]]
    
    # lấy các cột cần thiết
    recs = df.loc[top_indices, [
        "_id",
        "room.title",
        "room.price",
        "room.area",
        "room.address",
        "room.images"
    ]]
    
    # chuyển DataFrame sang list[dict]
    results = []
    for _, row in recs.iterrows():
        results.append({
            "_id": row["_id"],
            "room": {
                "title": row["room.title"],
                "price": row["room.price"],
                "area": row["room.area"],
                "address": row["room.address"],
                "images": row["room.images"],   
            }
        })
    return results

# ====== TEST ======
print(recommend(df["_id"].iloc[0]))

# ====== LƯU MODEL ======
joblib.dump({
    "tfidf_vectorizer": tfidf_vectorizer,
    "scaler": scaler,
    "df": df,
    "final_matrix": final_matrix,
    "cosine_sim": cosine_sim
}, "recommendation_model.pkl")

print("✅ Model saved to recommendation_model.pkl")
