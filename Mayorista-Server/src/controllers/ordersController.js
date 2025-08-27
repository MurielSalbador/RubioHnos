import Order from "../mongoModels/orders.mongo.js";
import Product from "../mongoModels/products.mongo.js";

// 📌 Crear pedido y descontar stock
export const createOrder = async (req, res) => {
  try {
    const { name, city, address, items, total } = req.body;
    const userEmail = req.user.email;

    if (!name || !city || !address || !items || items.length === 0 || !total) {
      return res.status(400).json({ error: "Faltan datos del pedido o el carrito está vacío" });
    }

    // 🔽 Validar stock y descontar
 await Promise.all(items.map(async ({ _id, quantity }) => {
  const product = await Product.findById(_id);
  if (!product) throw new Error(`Producto no encontrado: ${_id}`);
  if (product.stock < quantity) throw new Error(`Stock insuficiente para ${product.title}`);
  product.stock -= quantity;
  await product.save();
}));

    // Crear pedido
    const newOrder = await Order.create({
      name,
      city,
      address,
      items,
      total,
      email: userEmail,
      date: new Date().toISOString(),
      status: "Pendiente", // valor inicial
    });

    res.status(201).json({ message: "Pedido creado con éxito", order: newOrder });
  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
};

// 📌 Obtener todos los pedidos (solo admin o superAdmin)
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ error: "No autorizado para ver todos los pedidos" });
    }

    const allOrders = await Order.find().sort({ date: -1 });
    res.json(allOrders);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// 📌 Obtener pedidos de un usuario específico
export const getOrdersByUserEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (
      req.user.email !== email &&
      req.user.role !== "admin" &&
      req.user.role !== "superAdmin"
    ) {
      return res.status(403).json({ error: "No autorizado para ver estos pedidos" });
    }

    const userOrders = await Order.find({ email }).sort({ date: -1 });
    res.json(userOrders);
  } catch (error) {
    console.error("Error al obtener los pedidos del usuario:", error);
    res.status(500).json({ error: "No se pudieron obtener los pedidos del usuario" });
  }
};

// 📌 Actualizar estado de un pedido (solo admin o superAdmin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const allowedStatuses = ["Pendiente", "En progreso", "Completado"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    order.status = status;
    await order.save();

    res.json({ message: "Estado actualizado", order });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// 📌 Borrar pedido (solo superAdmin y si está completado)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "superAdmin") {
      return res.status(403).json({ error: "No autorizado para eliminar pedidos" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    if (order.status !== "Completado") {
      return res.status(400).json({ error: "Solo se pueden eliminar pedidos completados" });
    }

    await Order.deleteOne({ _id: id });

    res.json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error interno" });
  }
};