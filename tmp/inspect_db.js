import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from the server's .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "Mayorista-Server", ".env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI not found in process.env");
  // Try fallback if dotenv failed for some reason
  console.log("Current env keys:", Object.keys(process.env).filter(k => k.includes("MONGO")));
  process.exit(1);
}

console.log("Using MONGO_URI:", MONGO_URI.substring(0, 20) + "...");

// Define minimal schema for inspection
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

async function inspect() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const total = await Product.countDocuments();
    console.log(`Total products: ${total}`);

    const hasCategoryId = await Product.countDocuments({ categoryId: { $exists: true } });
    console.log(`Products with 'categoryId': ${hasCategoryId}`);

    const hasCategoryIds = await Product.countDocuments({ categoryIds: { $exists: true } });
    console.log(`Products with 'categoryIds': ${hasCategoryIds}`);

    const sample = await Product.findOne({ categoryId: { $exists: true } }).lean();
    if (sample) {
      console.log("Sample with 'categoryId':", JSON.stringify(sample, null, 2));
    }

    const sampleIds = await Product.findOne({ categoryIds: { $exists: true } }).lean();
    if (sampleIds) {
      console.log("Sample with 'categoryIds':", JSON.stringify(sampleIds, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

inspect();
