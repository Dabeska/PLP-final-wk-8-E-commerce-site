const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ data: null, error: "Admin privileges are required" });
  }

  return next();
};

module.exports = { requireAdmin };
