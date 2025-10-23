const {
    getAllUsers, getUserById, createUser, updateUser, deleteUser,
    getUserByEmail, saveRefreshToken, getUserByRefreshToken, clearRefreshToken,
    getUserByResetToken,
    updatePassword,
    setResetToken
} = require("../services/userService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const ACCESS_TOKEN_SECRET = "access_secret";
const REFRESH_TOKEN_SECRET = "refresh_secret";

exports.getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const newUser = await createUser(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        await updateUser(req.params.id, req.body);
        res.json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { email } = req.params;
        await deleteUser(email);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    await saveRefreshToken(user.id, refreshToken);

    res.json({
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
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



exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await setResetToken(email, token, expiry);

    const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${token}`;
    console.log("Reset link:", resetLink); // For testing

    // Send email using SendGrid API
    const msg = {
      to: email,
      from: process.env.MAIL_USER, // Verified sender in SendGrid
      subject: "Reset your password",
      html: `<p>Click the link below to reset your password (valid 15minutes):</p>
             <a href="${resetLink}">${resetLink}</a>`,
    };

    await sgMail.send(msg);

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ error: err.message });
  }
};


// requestPasswordReset using nodemailer

// exports.requestPasswordReset = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await getUserByEmail(email);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const token = crypto.randomBytes(32).toString("hex");
//     const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

//     await setResetToken(email, token, expiry);

//     const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${token}`;
//     console.log("Reset link:", resetLink); // For testing

//     // Use env variables for email
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       port: process.env.MAIL_PORT,
//       secure: false,
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.MAIL_USER,
//       to: email,
//       subject: "Reset your password",
//       text: `Click here to reset your password: ${resetLink}`,
//     });

//     res.json({ message: "Password reset link sent to your email." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// ✅ 2. Reset password




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
