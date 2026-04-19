const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access only" });
  }

  next();
};

const checkOwner = (req, res, next) => {
  if (!req.user || req.user.role !== "owner") {
    return res.status(403).json({ message: "Forbidden: Owner access only" });
  }

  next();
};

module.exports = {
  checkAdmin,
  checkOwner,
};
