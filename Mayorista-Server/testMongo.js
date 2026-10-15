import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;

const run = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Conectado a MongoDB");

    const testSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model("Test", testSchema);

    const doc = new Test({ name: "Primero" });
    await doc.save();

    console.log("Documento guardado, colección creada.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

run();
