const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../supabaseClient");

const ensureNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const getProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, stock, image_url, category_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getProducts error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch products" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getProducts unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, stock, image_url, category_id, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getProduct error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch product" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Product not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getProduct unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body || {};

    if (!name || category_id === undefined || category_id === null) {
      return res.status(400).json({ data: null, error: "Name and category_id are required" });
    }

    const priceValue = ensureNumber(price);
    const stockValue = ensureNumber(stock);

    if (priceValue === null) {
      return res.status(400).json({ data: null, error: "Price must be a valid number" });
    }

    if (stockValue === null) {
      return res.status(400).json({ data: null, error: "Stock must be a valid number" });
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description: description || null,
          price: priceValue,
          stock: stockValue,
          image_url: image_url || null,
          category_id
        }
      ])
      .select("id, name, description, price, stock, image_url, category_id, created_at, updated_at")
      .single();

    if (error) {
      console.error("createProduct error", error);
      return res.status(500).json({ data: null, error: "Failed to create product" });
    }

    return res.status(201).json({ data, error: null });
  } catch (error) {
    console.error("createProduct unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image_url, category_id } = req.body || {};

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      const priceValue = ensureNumber(price);
      if (priceValue === null) {
        return res.status(400).json({ data: null, error: "Price must be a valid number" });
      }
      updateData.price = priceValue;
    }
    if (stock !== undefined) {
      const stockValue = ensureNumber(stock);
      if (stockValue === null) {
        return res.status(400).json({ data: null, error: "Stock must be a valid number" });
      }
      updateData.stock = stockValue;
    }
    if (image_url !== undefined) updateData.image_url = image_url || null;
    if (category_id !== undefined) updateData.category_id = category_id;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ data: null, error: "No fields provided for update" });
    }

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select("id, name, description, price, stock, image_url, category_id, created_at, updated_at")
      .maybeSingle();

    if (error) {
      console.error("updateProduct error", error);
      return res.status(500).json({ data: null, error: "Failed to update product" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Product not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("updateProduct unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("deleteProduct error", error);
      return res.status(500).json({ data: null, error: "Failed to delete product" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "Product not found" });
    }

    return res.status(200).json({ data: { id: data.id }, error: null });
  } catch (error) {
    console.error("deleteProduct unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ data: null, error: "Image file is required" });
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
    const fileName = `products/${uuidv4()}${ext}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, req.file.buffer, {
        cacheControl: '3600',
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error("uploadProductImage error", error);
      return res.status(500).json({ data: null, error: "Failed to upload image" });
    }

    const publicUrlResult = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path || fileName);

    if (publicUrlResult.error) {
      console.error("uploadProductImage publicUrl error", publicUrlResult.error);
      return res.status(500).json({ data: null, error: "Failed to generate image URL" });
    }

    return res.status(201).json({ data: { url: publicUrlResult.data.publicUrl }, error: null });
  } catch (error) {
    console.error("uploadProductImage unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
};
