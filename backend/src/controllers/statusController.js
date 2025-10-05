const supabase = require("../supabaseClient");

const getStatuses = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("order_status")
      .select("id, status_name");

    if (error) {
      console.error("getStatuses error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch statuses" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getStatuses unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const getStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("order_status")
      .select("id, status_name")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getStatus error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch status" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Status not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getStatus unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const createStatus = async (req, res) => {
  try {
    const { status_name } = req.body || {};

    if (!status_name) {
      return res.status(400).json({ data: null, error: "status_name is required" });
    }

    const { data, error } = await supabase
      .from("order_status")
      .insert([
        {
          status_name
        }
      ])
      .select("id, status_name")
      .single();

    if (error) {
      console.error("createStatus error", error);
      return res.status(500).json({ data: null, error: "Failed to create status" });
    }

    return res.status(201).json({ data, error: null });
  } catch (error) {
    console.error("createStatus unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_name } = req.body || {};

    if (!status_name) {
      return res.status(400).json({ data: null, error: "status_name is required" });
    }

    const { data, error } = await supabase
      .from("order_status")
      .update({ status_name })
      .eq("id", id)
      .select("id, status_name")
      .maybeSingle();

    if (error) {
      console.error("updateStatus error", error);
      return res.status(500).json({ data: null, error: "Failed to update status" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Status not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("updateStatus unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("order_status")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("deleteStatus error", error);
      return res.status(500).json({ data: null, error: "Failed to delete status" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Status not found" });
    }

    return res.status(200).json({ data: { id: data.id }, error: null });
  } catch (error) {
    console.error("deleteStatus unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

module.exports = {
  getStatuses,
  getStatus,
  createStatus,
  updateStatus,
  deleteStatus
};
