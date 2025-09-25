// Script to update all user records and ensure they have the is_deleted field
import { MongoClient } from 'mongodb';

// MongoDB connection string
const uri = "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN";

const updateUserSchema = async () => {
  console.log("Starting schema migration to ensure all users have is_deleted field...");
  
  let client = null;
  
  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(uri, { ssl: true });
    
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");
    
    const db = client.db("PhongTroVN");
    const usersCollection = db.collection("users");
    
    // Find all users that don't have the is_deleted field
    console.log("Finding users without is_deleted field...");
    const usersToUpdate = await usersCollection.find({ 
      is_deleted: { $exists: false } 
    }).toArray();
    
    console.log(`Found ${usersToUpdate.length} users that need updating`);
    
    if (usersToUpdate.length > 0) {
      // Update all users that don't have is_deleted field
      console.log("Updating users with is_deleted field...");
      const updateResult = await usersCollection.updateMany(
        { is_deleted: { $exists: false } },
        { $set: { is_deleted: false } }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} users with is_deleted=false`);
    }
    
    // Verify the update worked
    console.log("Verifying update...");
    const usersWithoutField = await usersCollection.countDocuments({ 
      is_deleted: { $exists: false } 
    });
    
    if (usersWithoutField === 0) {
      console.log("✅ Success! All users now have the is_deleted field");
    } else {
      console.log(`❌ Error: There are still ${usersWithoutField} users without the is_deleted field`);
    }
    
  } catch (error) {
    console.error("Error during schema migration:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("Closed MongoDB connection");
    }
  }
};

// Run the migration
updateUserSchema().catch(console.error);