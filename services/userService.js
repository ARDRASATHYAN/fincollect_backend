const db = require("../db");
const bcrypt = require("bcrypt");

const UserService = {
  getAllUsers: () =>
    new Promise((resolve, reject) => {
      db.query("SELECT * FROM users", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),

  getUserByEmail: (email) =>
    new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE email=?", [email], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    }),

  saveRefreshToken: (id, token) =>
    new Promise((resolve, reject) => {
      db.query("UPDATE users SET refresh_token=? WHERE id=?", [token, id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),

  getUserByRefreshToken: (token) =>
    new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE refresh_token=?", [token], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    }),

  clearRefreshToken: (id) =>
    new Promise((resolve, reject) => {
      db.query("UPDATE users SET refresh_token=NULL WHERE id=?", [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),

  getUserById: (id) =>
    new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    }),

 createUser: async ({ name, email, password, role, status }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, status ? 1 : 0],
      (err, results) => {
        if (err) reject(err);
        else
          resolve({
            id: results.insertId,
            name,
            email,
            role,
            status,
          });
      }
    );
  });
},


  updateUser: (id, { name, email, role, status }) =>
    new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET name=?, email=?, role=?, status=? WHERE id=?",
        [name, email, role, status, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    }),

  deleteUser: (email) =>
    new Promise((resolve, reject) => {
      db.query("DELETE FROM users WHERE email=?", [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),   



    setResetToken: (email, token, expiry) =>
    new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET reset_token=?, reset_token_expiry=? WHERE email=?",
        [token, expiry, email],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    }),

  // ✅ Get user by reset token
  getUserByResetToken: (token) =>
    new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE reset_token=? AND reset_token_expiry > NOW()",
        [token],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        }
      );
    }),

  // ✅ Update password
  updatePassword: async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE email=?",
        [hashedPassword, email],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },
};

module.exports = UserService;
