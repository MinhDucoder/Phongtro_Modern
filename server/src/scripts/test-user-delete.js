// Test script for user deletion functionality
// Make this file an ES module
import { MongoClient, ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// MongoDB connection string - same as in your mongodbConfig.js
const uri = "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN";

const testUserDelete = async () => {
  console.log("Testing user deletion functionality directly with MongoDB...");
  
  let client = null;
  
  try {
    console.log("1. Connecting to MongoDB...");
    client = new MongoClient(uri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      ssl: true
    });
    
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");
    
    const db = client.db("PhongTroVN");
    const usersCollection = db.collection("users");
  
  // Now, test the user deletion directly with MongoDB
    console.log("\n2. Finding users to test deletion...");
    
    // Find one non-admin user to test deletion
    const users = await usersCollection.find({ 
      role: { $ne: 'admin' }, 
      is_deleted: { $ne: true } 
    }).limit(10).toArray();
    
    if (!users.length) {
      console.error("No suitable users found to test deletion!");
      return;
    }
    
    // Select a test user
    const testUser = users[0];
    console.log(`Found test user: ${testUser._id} (${testUser.full_name}, ${testUser.email})`);
    
    // First, verify if is_deleted field exists in the schema
    console.log("\n3. Checking if is_deleted field exists in the user schema...");
    if ('is_deleted' in testUser) {
      console.log("✅ is_deleted field exists in the user schema");
    } else {
      console.log("⚠️ is_deleted field does not exist in the user schema - this might be the problem!");
      // Let's try to add it with an update
      console.log("   Adding is_deleted field to the user schema...");
      
      // We won't modify the actual schema but we'll try to update the test user with is_deleted field
    }
    
    // Now test updating the user with is_deleted flag directly
    console.log(`\n4. Testing direct MongoDB update for user ${testUser._id}...`);
    
    // First, make a copy of the user before modification
    const userBeforeUpdate = {...testUser};
    
    // Attempt to update the user with is_deleted: true
    const updateResult = await usersCollection.updateOne(
      { _id: testUser._id }, 
      { $set: { is_deleted: true, deleted_at: new Date() } }
    );
    
    console.log("MongoDB update result:", updateResult);
    
    if (updateResult.matchedCount === 1 && updateResult.modifiedCount === 1) {
      console.log("✅ Successfully updated the user with is_deleted=true");
    } else if (updateResult.matchedCount === 1 && updateResult.modifiedCount === 0) {
      console.log("⚠️ User was found but not modified - might already be deleted or schema restrictions");
    } else {
      console.log("❌ Failed to update user");
    }
    
    // Verify if the user was truly modified
    console.log(`\n5. Verifying if user ${testUser._id} was actually modified...`);
    const modifiedUser = await usersCollection.findOne({ _id: testUser._id });
    
    console.log("User before update:", {
      _id: userBeforeUpdate._id.toString(),
      full_name: userBeforeUpdate.full_name,
      email: userBeforeUpdate.email,
      is_deleted: userBeforeUpdate.is_deleted
    });
    
    console.log("User after update:", {
      _id: modifiedUser._id.toString(),
      full_name: modifiedUser.full_name,
      email: modifiedUser.email,
      is_deleted: modifiedUser.is_deleted,
      deleted_at: modifiedUser.deleted_at
    });
    
    // Now, let's try a hard delete
    console.log(`\n6. Testing hard deletion for user ${testUser._id}...`);
    
    // We won't actually delete the user, just print what would happen
    console.log(`For an actual hard delete, you would run: await usersCollection.deleteOne({ _id: testUser._id })`);
    
    // Summary of what we found
    console.log("\n=== DIAGNOSIS SUMMARY ===");
    if (modifiedUser.is_deleted === true) {
      console.log("✅ Soft delete works correctly with direct MongoDB operations");
      console.log("✅ This suggests the problem is likely in your API endpoint implementation");
    } else {
      console.log("❌ Even direct MongoDB operations failed to modify the user");
      console.log("❌ This suggests a more fundamental problem with the database or schema");
    }
    
    // Restore the user to its original state if modified
    if (modifiedUser.is_deleted === true) {
      console.log("\nRestoring user to original state...");
      const restoreResult = await usersCollection.updateOne(
        { _id: testUser._id },
        { $set: { is_deleted: userBeforeUpdate.is_deleted || false }, $unset: { deleted_at: "" } }
      );
      console.log("Restore result:", restoreResult);
    }
    
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Close the MongoDB connection
    if (client) {
      await client.close();
      console.log("\nClosed MongoDB connection");
    }
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run the test
testUserDelete().catch(console.error);