import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import Profile from './src/models/Profile.js';
import { generateUUIDv7 } from './src/utils/uuid.js';

dotenv.config();

console.log("🚀 Starting seeding process...");

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Check if profiles.json exists
    const filePath = './profiles.json';
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: profiles.json not found at ${filePath}`);
      process.exit(1);
    }

    console.log("Reading profiles.json...");
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    const profiles = data.profiles || data; // Handle if wrapped in profiles key

    console.log(`📊 Found ${profiles.length} profiles in the JSON file`);

    // Get all existing names in one query
    const existingNames = new Set((await Profile.find({}, 'name').lean()).map(p => p.name));
    console.log(`📊 Found ${existingNames.size} existing profiles in database`);

    let addedCount = 0;
    let skippedCount = 0;
    const toInsert = [];

    for (const profileData of profiles) {
      const normalizedName = profileData.name.toLowerCase().trim();

      if (existingNames.has(normalizedName)) {
        skippedCount++;
        continue;
      }

      toInsert.push({
        id: profileData.id || generateUUIDv7(),
        name: normalizedName,
        gender: profileData.gender,
        gender_probability: profileData.gender_probability,
        age: profileData.age,
        age_group: profileData.age_group,
        country_id: profileData.country_id,
        country_name: profileData.country_name,
        country_probability: profileData.country_probability,
        created_at: profileData.created_at || new Date()
      });
    }

    if (toInsert.length > 0) {
      await Profile.insertMany(toInsert);
      addedCount = toInsert.length;
    }

    const totalInDb = await Profile.countDocuments();

    console.log(`\n✅ Seeding completed successfully!`);
    console.log(`   Added new profiles : ${addedCount}`);
    console.log(`   Skipped (already existed): ${skippedCount}`);
    console.log(`   Total profiles in database: ${totalInDb}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.stack) console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

seedDatabase();