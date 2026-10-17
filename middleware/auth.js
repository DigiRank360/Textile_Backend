import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Please login." });
  }

  if (!process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({ success: false, message: "JWT_SECRET is not configured." });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Session expired. Please login again." });
  }
};
