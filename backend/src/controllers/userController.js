const bcrypt = require("bcryptjs");
const supabase = require("../supabaseClient");

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getUsers error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch users" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getUsers unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === "admin";
    const isSelf = String(req.user?.id) === String(id);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ data: null, error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getUserById error", error);
      return res.status(500).json({ data: null, error: "Failed to fetch user" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "User not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("getUserById unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ data: null, error: "Name, email, and password are required" });
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("createUser fetch error", fetchError);
      return res.status(500).json({ data: null, error: "Failed to check existing user" });
    }

    if (existingUser) {
      return res.status(409).json({ data: null, error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: createdUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role,
          created_at: new Date().toISOString()
        }
      ])
      .select("id, name, email, role, created_at")
      .single();

    if (insertError) {
      console.error("createUser insert error", insertError);
      return res.status(500).json({ data: null, error: "Failed to create user" });
    }

    return res.status(201).json({ data: createdUser, error: null });
  } catch (error) {
    console.error("createUser unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body || {};
    const isAdmin = req.user?.role === "admin";
    const isSelf = String(req.user?.id) === String(id);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ data: null, error: "Access denied" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role !== undefined && isAdmin) updateData.role = role;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ data: null, error: "No fields provided for update" });
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, name, email, role, created_at")
      .maybeSingle();

    if (error) {
      console.error("updateUser error", error);
      return res.status(500).json({ data: null, error: "Failed to update user" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "User not found" });
    }

    return res.status(200).json({ data, error: null });
  } catch (error) {
    console.error("updateUser unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("deleteUser error", error);
      return res.status(500).json({ data: null, error: "Failed to delete user" });
    }

    if (!data) {
      return res.status(404).json({ data: null, error: "User not found" });
    }

    return res.status(200).json({ data: { id: data.id }, error: null });
  } catch (error) {
    console.error("deleteUser unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
