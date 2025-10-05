const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../supabaseClient");

const USERS_TABLE = "USERS";

const resolveName = (user) => user?.full_name || user?.fullName || user?.name || "";

const formatUser = (user) => {
  if (!user) return null;

  return {
    id: String(user.id),
    email: user.email,
    fullName: resolveName(user),
    role: user.role || "customer",
    createdAt: user.created_at ?? user.createdAt ?? undefined
  };
};

const issueToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: resolveName(user),
      role: user.role || "customer"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    }
  );
};

const registerUser = async (req, res) => {
  try {
    const { fullName, name, email, password, role } = req.body || {};
    const resolvedName = fullName || name;
    const userRole = role || "customer";

    if (!resolvedName || !email || !password) {
      return res.status(400).json({ data: null, error: "Name, email, and password are required" });
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("registerUser fetch error", fetchError);
      return res.status(500).json({ data: null, error: "Failed to check existing user" });
    }

    if (existingUser) {
      return res.status(409).json({ data: null, error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: resolvedName,
          email,
          password: hashedPassword,
          role: userRole,
          created_at: new Date().toISOString()
        }
      ])
      .select("id, name, email, role, created_at")
      .single();

    if (insertError) {
      console.error("registerUser insert error", insertError);
      return res.status(500).json({ data: null, error: "Failed to create user" });
    }

    let token;
    try {
      token = issueToken(createdUser);
    } catch (tokenError) {
      console.error("registerUser token error", tokenError);
      return res.status(500).json({ data: null, error: "Authentication service misconfigured" });
    }

    return res.status(201).json({
      data: {
        user: formatUser(createdUser),
        token
      },
      error: null
    });
  } catch (error) {
    console.error("registerUser unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ data: null, error: "Email and password are required" });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select("id, name, email, password, role, created_at")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("loginUser fetch error", fetchError);
      return res.status(500).json({ data: null, error: "Failed to retrieve user" });
    }

    if (!user) {
      return res.status(401).json({ data: null, error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return res.status(401).json({ data: null, error: "Invalid credentials" });
    }

    let token;
    try {
      token = issueToken(user);
    } catch (tokenError) {
      console.error("loginUser token error", tokenError);
      return res.status(500).json({ data: null, error: "Authentication service misconfigured" });
    }

    return res.status(200).json({
      data: {
        user: formatUser(user),
        token
      },
      error: null
    });
  } catch (error) {
    console.error("loginUser unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ data: null, error: "Unauthorized" });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select("id, name, email, role, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("getCurrentUser fetch error", error);
      return res.status(500).json({ data: null, error: "Failed to retrieve user" });
    }

    if (!user) {
      return res.status(404).json({ data: null, error: "User not found" });
    }

    return res.status(200).json({
      data: {
        user: formatUser(user)
      },
      error: null
    });
  } catch (error) {
    console.error("getCurrentUser unexpected error", error);
    return res.status(500).json({ data: null, error: "Unexpected server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};