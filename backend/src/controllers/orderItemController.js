const supabase = require("../supabaseClient");

const getOrderItems = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("order_items")
      .select("id, order_id, product_id, quantity, price");

    if (error) {
      console.error("getOrderItems error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch order items" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getOrderItems unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const getOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("order_items")
      .select("id, order_id, product_id, quantity, price")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getOrderItem error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch order item" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Order item not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getOrderItem unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const createOrderItem = async (req, res) => {
  try {
    const { order_id, product_id, quantity, price } = req.body || {};

    if (!order_id || !product_id || !quantity || price === undefined) {
      return res.status(400).json({ data: null, error: "order_id, product_id, quantity, and price are required" });
    }

    const { data, error } = await supabase
      .from("order_items")
      .insert([
        {
          order_id,
          product_id,
          quantity,
          price
        }
      ])
      .select("id, order_id, product_id, quantity, price")
      .single();

    if (error) {
      console.error("createOrderItem error", error);
      return res.status(500).json({ data: null, error: "Failed to create order item" });
    }

    return res.status(201).json({ data, error: null });
  } catch (error) {
    console.error("createOrderItem unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id, product_id, quantity, price } = req.body || {};

    const updateData = {};
    if (order_id !== undefined) updateData.order_id = order_id;
    if (product_id !== undefined) updateData.product_id = product_id;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (price !== undefined) updateData.price = price;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ data: null, error: "No fields provided for update" });
    }

    const { data, error } = await supabase
      .from("order_items")
      .update(updateData)
      .eq("id", id)
      .select("id, order_id, product_id, quantity, price")
      .maybeSingle();

    if (error) {
      console.error("updateOrderItem error", error);
      return res.status(500).json({ data: null, error: "Failed to update order item" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Order item not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("updateOrderItem unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("order_items")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("deleteOrderItem error", error);
      return res.status(500).json({ data: null, error: "Failed to delete order item" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Order item not found" });
    }

    return res.status(200).json({ data: { id: data.id }, error: null });
  } catch (error) {
    console.error("deleteOrderItem unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

module.exports = {
  getOrderItems,
  getOrderItem,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem
};
