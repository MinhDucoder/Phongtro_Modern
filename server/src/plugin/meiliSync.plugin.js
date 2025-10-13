import { meiliClient } from "~/config/meilisearch.config.mjs";

export function meiliSyncPlugin(schema, options) {
  const { indexName, formatFn } = options;
  const index = meiliClient.index(indexName);

  // ➕ Khi tạo mới
  schema.post("save", async function (doc) {
    try {
      const formatted = await formatFn(doc);
      await index.addDocuments([formatted]);
    } catch (err) {
      throw new Error("Meili add error: " + err.message);
    }
  });

  // ✏️ Khi update
  schema.post("findOneAndUpdate", async function (result) {
    try {
      if (!result) return;
      const formatted = await formatFn(result);
      await index.updateDocuments([formatted]);
    } catch (err) {
      throw new Error("Meili update error: " + err.message);
    }
  });

  // ❌ Khi xóa
  schema.post("findOneAndDelete", async function (result) {
    try {
      if (!result) return;
      await index.deleteDocument(result._id.toString());
    } catch (err) {
      throw new Error("Meili delete error: " + err.message);
    }
  });
}
