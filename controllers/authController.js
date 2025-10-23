
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const { getUserByEmail, saveRefreshToken, getUserByRefreshToken, clearRefreshToken, setResetToken, getUserByResetToken, updatePassword } = require("../services/userService");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const ACCESS_TOKEN_SECRET = "access_secret";
const REFRESH_TOKEN_SECRET = "refresh_secret";

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    await saveRefreshToken(user.id, refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const user = await getUserByRefreshToken(token);
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(token, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        await clearRefreshToken(user.id);
        return res.status(403).json({ message: "Refresh token expired" });
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REQUEST PASSWORD RESET
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await setResetToken(email, token, expiry);
    const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${token}`;

    const msg = {
      to: email,
      from: process.env.MAIL_USER,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial; line-height: 1.5;">
          <h2 style="color:#01050b;">Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <a href="${resetLink}" style="background:#01050b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
          <p>If you didn’t request this, ignore this email.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ error: err.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await getUserByResetToken(token);
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    await updatePassword(user.email, password);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
