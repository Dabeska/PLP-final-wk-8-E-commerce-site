const supabase = require("../supabaseClient");

const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description");

    if (error) {
      console.error("getCategories error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch categories" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getCategories unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getCategory error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch category" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Category not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getCategory unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};

    if (!name) {
      return res.status(400).json({ data: null, error: "Name is required" });
    }

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name,
          description: description || null
        }
      ])
      .select("id, name, description")
      .single();

    if (error) {
      console.error("createCategory error", error);
      return res.status(500).json({ data: null, error: "Failed to create category" });
    }

    return res.status(201).json({ data, error: null });
  } catch (error) {
    console.error("createCategory unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ data: null, error: "No fields provided for update" });
    }

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select("id, name, description")
      .maybeSingle();

    if (error) {
      console.error("updateCategory error", error);
      return res.status(500).json({ data: null, error: "Failed to update category" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Category not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("updateCategory unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("deleteCategory error", error);
      return res.status(500).json({ data: null, error: "Failed to delete category" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Category not found" });
    }

    return res.status(200).json({ data: { id: data.id }, error: null });
  } catch (error) {
    console.error("deleteCategory unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
