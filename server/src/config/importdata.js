import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// === Setup path ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Mongo URI ===
const uri =
  "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/?retryWrites=true&w=majority&appName=PhongTroVN";
const client = new MongoClient(uri);

// === Hàm convert Extended JSON ($oid, $date) ===
function convertExtendedJSON(doc) {
  if (Array.isArray(doc)) {
    return doc.map(convertExtendedJSON);
  } else if (doc && typeof doc === "object") {
    if ("$oid" in doc) return new ObjectId(doc.$oid);
    if ("$date" in doc) return new Date(doc.$date);

    const newDoc = {};
    for (const [k, v] of Object.entries(doc)) {
      newDoc[k] = convertExtendedJSON(v);
    }
    return newDoc;
  }
  return doc;
}

// === Import data ===
async function importData() {
  try {
    await client.connect();
    const db = client.db("PhongTroVN");

    const filePath = path.join(__dirname, "phongtro_mongodb.json");
    const rawData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    for (const [collection, docs] of Object.entries(rawData)) {
      if (Array.isArray(docs)) {
        const convertedDocs = docs.map(convertExtendedJSON);
        await db.collection(collection).insertMany(convertedDocs);
        console.log(`✅ Imported ${convertedDocs.length} docs into ${collection}`);
      }
    }
  } catch (err) {
    console.error("❌ Error importing data:", err);
  } finally {
    await client.close();
  }
}

importData();
