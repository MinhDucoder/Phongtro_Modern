import { MongoClient } from "mongodb";

const atlasUri = "mongodb+srv://USERNAME:PASSWORD@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN";
const localUri = "mongodb://localhost:27017/PhongTroVN";

const transfer = async () => {
  const atlas = new MongoClient(atlasUri);
  const local = new MongoClient(localUri);

  await atlas.connect();
  await local.connect();

  const dbAtlas = atlas.db("PhongTroVN");
  const dbLocal = local.db("PhongTroVN");

  const collections = await dbAtlas.listCollections().toArray();

  for (const { name } of collections) {
    const data = await dbAtlas.collection(name).find().toArray();
    if (data.length) {
      await dbLocal.collection(name).insertMany(data);
      console.log(`✅ Copied ${data.length} docs from ${name}`);
    }
  }

  await atlas.close();
  await local.close();
};

transfer().catch(console.error);
