import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: String, required: true },
  items: { type: Array, required: true }, // puede ser más detallado si querés validar la estructura
  total: { type: String, required: true },
  email: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pendiente", "En progreso", "Completado"],
    default: "Pendiente",
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
