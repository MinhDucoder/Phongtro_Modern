import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ZALO_API_KEY = process.env.ZALO_API_KEY;
const ZALO_SENTIMENT_URL = "https://api.zalo.ai/v1/nlp/sentiment";

export async function analyzeSentiment(text) {
  try {
    console.log("ZALO_URL:", ZALO_SENTIMENT_URL);
    console.log("API_KEY:", !!ZALO_API_KEY);


    const response = await axios.post(
      ZALO_SENTIMENT_URL,
      { input: text },
      {
        headers: {
          "api_key": ZALO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(response.data);

    return response.data?.data;
  } catch (err) {   
    console.error("❌ ZaloAI Error:", err.response?.data || err.message);
    return null;
  }
}
