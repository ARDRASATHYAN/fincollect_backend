const jwt = require("jsonwebtoken");
const { getUserByRefreshToken, clearRefreshToken } = require("../services/userService");


exports.refreshToken = async (req, res) => {
  const { token } = req.body; // frontend sends refresh token in body
  if (!token) return res.status(401).json({ message: "No refresh token" });

  const user = await getUserByRefreshToken(token);
  if (!user) return res.status(403).json({ message: "Invalid refresh token" });

  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    res.json({ accessToken });
  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

exports.logout = async (req, res) => {
  const { token } = req.body;
  const user = await getUserByRefreshToken(token);
  if (user) {
    await clearRefreshToken(user.id);
  }
  res.json({ message: "Logged out" });
};
