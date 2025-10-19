import { connectDB } from "./src/config/mongodbConfig.js";
import { initSearchConfig, syncDataToMeiliSearch } from "./src/services/meiliSearchService.js";

async function test() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    console.log("📚 Initializing MeiliSearch config...");
    await initSearchConfig();
    console.log("✅ MeiliSearch config initialized");

    console.log("🔄 Syncing data to MeiliSearch...");
    await syncDataToMeiliSearch();
    console.log("✅ Data synced successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

test();
