import Orders from "../models/orders.js";

// Obtener todos los pedidos (solo admin)
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ error: "No autorizado para ver todos los pedidos" });
    }

    const allOrders = await Orders.findAll();
    res.json(allOrders);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error interno" });
  }
};



// Obtener pedidos de un usuario específico
export const getOrdersByUserEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Opcional: verificar que el usuario que hace la consulta coincide con el email, o es admin
    if (req.user.email !== email && req.user.role !== "admin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ error: "No autorizado para ver estos pedidos" });
    }

    const userOrders = await Orders.findAll({ where: { email } });
    res.json(userOrders);
  } catch (error) {
    console.error("Error al obtener los pedidos del usuario:", error);
    res.status(500).json({ error: "No se pudieron obtener los pedidos del usuario" });
  }
};

// Crear nuevo pedido
export const createOrder = async (req, res) => {
  try {
    const { name, city, address, items, total } = req.body;
    const userEmail = req.user.email;

    if (!name || !city || !address || !items || !total) {
      return res.status(400).json({ error: "Faltan datos del pedido" });
    }

    const newOrder = await Orders.create({
      name,
      city,
      address,
      date: new Date().toISOString(),
      items,
      total,
      email: userEmail,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).json({ error: "No se pudo guardar el pedido" });
  }
};


// Actualizar estado de un pedido (solo admin)
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

    const order = await Orders.findByPk(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    order.status = status;
    await order.save();

    res.json({ message: "Estado actualizado", order });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// Borrar pedido por id (solo admin y pedido completado)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "superAdmin") {
      return res.status(403).json({ error: "No autorizado para eliminar pedidos" });
    }

    const order = await Orders.findByPk(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    if (order.status !== "Completado") {
      return res.status(400).json({ error: "Solo se pueden eliminar pedidos completados" });
    }

    await order.destroy();

    res.json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error interno" });
  }
};