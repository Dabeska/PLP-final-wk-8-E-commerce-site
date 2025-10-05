const supabase = require("../supabaseClient");

const ORDER_ITEMS_TABLE = "order_items";
const STATUS_TABLE = "order_status";

const withOrderItems = async (orders) => {
  if (!orders || orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);

  const { data: items, error } = await supabase
    .from(ORDER_ITEMS_TABLE)
    .select(
      "id, order_id, product_id, quantity, price, products ( id, name, description, price, stock, image_url, category_id )"
    )
    .in("order_id", orderIds);

  if (error) {
    console.error("withOrderItems fetch error", error);
    throw new Error("Failed to fetch order items");
  }

  const itemsByOrder = (items ?? []).reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }

    const productData = item.products || item.product || null;

    acc[item.order_id].push({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      product: productData
        ? {
            id: productData.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            image_url: productData.image_url,
            category_id: productData.category_id
          }
        : null
    });
    return acc;
  }, {});

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder[order.id] || []
  }));
};

const resolveStatusId = async (identifier) => {
  if (identifier === undefined || identifier === null || identifier === "") {
    return null;
  }

  const numericValue = Number(identifier);
  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  const name = identifier.toString().trim();
  if (!name) {
    return null;
  }

  const { data, error } = await supabase
    .from(STATUS_TABLE)
    .select("id, status_name")
    .ilike("status_name", name)
    .maybeSingle();

  if (error) {
    console.error("resolveStatusId error", error);
    throw new Error("Failed to resolve status");
  }

  return data?.id ?? null;
};

const getOrders = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const query = supabase
      .from("orders")
      .select("id, user_id, status_id, total_price, created_at")
      .order("created_at", { ascending: false });

    const { data: orders, error } = isAdmin
      ? await query
      : await query.eq("user_id", req.user?.id);

    if (error) {
      console.error("getOrders error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch orders" });
    }

    const enrichedOrders = await withOrderItems(orders ?? []);

    return res.status(200).json({ data: enrichedOrders, error: null });
  } catch (error) {
    console.error("getOrders unexpected error", error);
    return res.status(500).json({ data: null, error: error.message || "Unexpected server error" });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === "admin";

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, user_id, status_id, total_price, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getOrder error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch order" });
    }

    if (!order) {
      return res.status(404).json({ data: null, error: "Order not found" });
    }

    if (!isAdmin && String(order.user_id) !== String(req.user?.id)) {
      return res.status(403).json({ data: null, error: "Access denied" });
    }

    const enrichedOrder = (await withOrderItems([order]))[0];

    return res.status(200).json({ data: enrichedOrder, error: null });
  } catch (error) {
    console.error("getOrder unexpected error", error);
    return res.status(500).json({ data: null, error: error.message || "Unexpected server error" });
  }
};

const resolveDefaultPendingStatus = async () => {
  const statusNames = ["Pending", "Processing"];
  for (const name of statusNames) {
    const id = await resolveStatusId(name);
    if (id) {
      return id;
    }
  }
  return null;
};

const resolveCancelledStatus = async () => {
  const statusNames = ["Cancelled", "Canceled"];
  for (const name of statusNames) {
    const id = await resolveStatusId(name);
    if (id) {
      return id;
    }
  }
  return null;
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status_id, status_name, total_price, order_items: orderItems = [] } = req.body || {};

    if (!total_price || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ data: null, error: "Total price and at least one order item are required" });
    }

    const invalidItem = orderItems.find(
      (item) => !item || !item.product_id || !item.quantity || !item.price
    );

    if (invalidItem) {
      return res.status(400).json({ data: null, error: "Each order item requires product_id, quantity, and price" });
    }

    let resolvedStatusId = await resolveStatusId(status_id ?? status_name ?? null);
    if (!resolvedStatusId) {
      resolvedStatusId = await resolveDefaultPendingStatus();
    }

    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          status_id: resolvedStatusId,
          total_price,
          created_at: new Date().toISOString()
        }
      ])
      .select("id, user_id, status_id, total_price, created_at")
      .single();

    if (insertError) {
      console.error("createOrder insert error", insertError);
      return res.status(500).json({ data: null, error: "Failed to create order" });
    }

    const itemsPayload = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from(ORDER_ITEMS_TABLE)
      .insert(itemsPayload);

    if (itemsError) {
      console.error("createOrder items error", itemsError);
      return res.status(500).json({ data: null, error: "Failed to create order items" });
    }

    const enrichedOrder = (await withOrderItems([order]))[0];

    return res.status(201).json({
      data: enrichedOrder,
      error: null
    });
  } catch (error) {
    console.error("createOrder unexpected error", error);
    return res.status(500).json({ data: null, error: error.message || "Unexpected server error" });
  }
};

const updateOrder = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ data: null, error: "Admin privileges are required" });
    }

    const { id } = req.params;
    const { status_id, status_name, total_price, user_id } = req.body || {};

    const updateData = {};

    if (status_id !== undefined || status_name !== undefined) {
      const resolvedStatusId = await resolveStatusId(status_id ?? status_name ?? null);
      if (!resolvedStatusId) {
        return res.status(400).json({ data: null, error: "Invalid status provided" });
      }
      updateData.status_id = resolvedStatusId;
    }

    if (total_price !== undefined) {
      const totalValue = Number(total_price);
      if (!Number.isFinite(totalValue)) {
        return res.status(400).json({ data: null, error: "total_price must be a number" });
      }
      updateData.total_price = totalValue;
    }

    if (user_id !== undefined) {
      updateData.user_id = user_id;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ data: null, error: "No fields provided for update" });
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select("id, user_id, status_id, total_price, created_at")
      .maybeSingle();

    if (error) {
      console.error("updateOrder error", error);
      return res.status(500).json({ data: null, error: "Failed to update order" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Order not found" });
    }

    const enrichedOrder = (await withOrderItems([data]))[0];

    return res.status(200).json({ data: enrichedOrder, error: null });
  } catch (error) {
    console.error("updateOrder unexpected error", error);
    return res.status(500).json({ data: null, error: error.message || "Unexpected server error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, user_id, status_id, total_price, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("cancelOrder fetch error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch order" });
    }

    if (!order) {
      return res.status(404).json({ data: null, error: "Order not found" });
    }

    if (String(order.user_id) !== String(userId)) {
      return res.status(403).json({ data: null, error: "Access denied" });
    }

    const cancelledStatusId = await resolveCancelledStatus();
    if (!cancelledStatusId) {
      return res.status(500).json({ data: null, error: "Cancellation status not configured" });
    }

    if (Number(order.status_id) === Number(cancelledStatusId)) {
      const enrichedOrder = (await withOrderItems([order]))[0];
      return res.status(200).json({ data: enrichedOrder, error: null });
    }

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ status_id: cancelledStatusId })
      .eq("id", id)
      .select("id, user_id, status_id, total_price, created_at")
      .maybeSingle();

    if (updateError) {
      console.error("cancelOrder update error", updateError);
      return res.status(500).json({ data: null, error: "Failed to cancel order" });
    }

    const enrichedOrder = (await withOrderItems([updated]))[0];

    return res.status(200).json({ data: enrichedOrder, error: null });
  } catch (error) {
    console.error("cancelOrder unexpected error", error);
    return res.status(500).json({ data: null, error: error.message || "Unexpected server error" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ data: null, error: "Admin privileges are required" });
    }

    const { id } = req.params;

    const { data: items, error: itemsError } = await supabase
      .from(ORDER_ITEMS_TABLE)
      .delete()
      .eq("order_id", id)
      .select("id");

    if (itemsError) {
      console.error("deleteOrder items error", itemsError);
      return res.status(500).json({ data: null, error: "Failed to remove order items" });
    }

    const { data, error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("deleteOrder error", error);
      return res.status(500).json({ data: null, error: "Failed to delete order" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Order not found" });
    }

    return res.status(200).json({ data: { id: data.id, removedItems: items || [] }, error: null });
  } catch (error) {
    console.error("deleteOrder unexpected error", error);
    return res.status(500).json({ data: null, error: error.message || "Unexpected server error" });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  cancelOrder,
  deleteOrder
};
