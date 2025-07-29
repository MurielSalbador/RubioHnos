import mongoose from "mongoose";

const uri = "mongodb+srv://MurielSalbador:lPV57COwRzyWtIq8@cluster0.qsuip80.mongodb.net/RubiHnos?retryWrites=true&w=majority&appName=Cluster0"; // poné tu string de conexión de MongoDB Atlas aquí

const run = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Conectado a MongoDB");

    const testSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model("Test", testSchema);

    const doc = new Test({ name: "Primero" });
    await doc.save();

    console.log("Documento guardado, colección creada.");
    process.exit(0); // salir del proceso
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

run();
