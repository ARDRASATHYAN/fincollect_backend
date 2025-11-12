const db = require("../db");
const bcrypt = require("bcryptjs");

// ✅ GET all bank users (with optional filters)
exports.getAllBUser = (req, res) => {
  const { bid, search } = req.query;

  let sql = `SELECT * FROM buser WHERE 1=1`;
  const params = [];

  if (bid) {
    sql += ` AND bid = ?`;
    params.push(bid);
  }

  if (search) {
    sql += ` AND (name LIKE ? OR mobile LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ✅ CREATE new bank user
exports.createBUser = async (req, res) => {
  try {
    let {
      bid, mobile, name,
      pwd, pin, status, enabled,
      last_login_date, pwd_changed_date,
      pwd_expiry_days, pwdloginattempt, pinloginattempt,
    } = req.body;

    name = name?.toUpperCase();
    const hashedPwd = await bcrypt.hash(pwd, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    // Check duplicate key (bid-mobile combination)
    db.query(
      "SELECT * FROM buser WHERE bid = ? AND mobile = ?",
      [bid, mobile],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0)
          return res.status(400).json({ error: "buser already exists!" });

        // Insert new record
        const insertSql = `
          INSERT INTO buser
          (bid, mobile, name, pwd, pin, status, enabled,
           pwd_expiry_days, pwdloginattempt, pinloginattempt,
           last_login_date, pwd_changed_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          bid, mobile, name,
          hashedPwd, hashedPin, status, enabled ? 1 : 0,
          pwd_expiry_days, pwdloginattempt, pinloginattempt,
          last_login_date, pwd_changed_date,
        ];

        db.query(insertSql, values, (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({
            message: "buser added successfully",
            id: `${bid}-${mobile}`,
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET buser by ID
exports.getBUserById = (req, res) => {
  const { bid, mobile } = req.params;
  db.query("SELECT * FROM buser WHERE bid = ? AND mobile = ?", [bid, mobile], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "buser not found" });

    const buser = { ...results[0], enabled: results[0].enabled === 1 };
    res.json(buser);
  });
};

// ✅ UPDATE buser
exports.updateBUser = async (req, res) => {
  const { bid, mobile } = req.params;
  let {
    name,
    pwd,
    pin,
    status,
    enabled,
    pwd_expiry_days,
    pwdloginattempt,
    pinloginattempt,
  } = req.body;

  if (!req.body) return res.status(400).json({ error: "No data provided" });

  try {
    const saltRounds = 10;

    // 🔹 Fetch existing record
    const existingResult = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM buser WHERE bid = ? AND mobile = ?",
        [bid, mobile],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    if (!existingResult.length)
      return res.status(404).json({ error: "buser not found" });

    const existing = existingResult[0];

    // 🔹 Hash password/pin only if new ones are provided
    if (pwd && !pwd.startsWith("$2b$"))
      pwd = await bcrypt.hash(pwd, saltRounds);
    else pwd = existing.pwd;

    if (pin && !pin.startsWith("$2b$"))
      pin = await bcrypt.hash(pin, saltRounds);
    else pin = existing.pin;

    // 🔹 Normalize fields
    name = name?.toUpperCase() || existing.name;
    enabled = enabled ? 1 : 0;

    // 🔹 Update query
    const sql = `
      UPDATE buser
      SET name=?, pwd=?, pin=?, status=?, enabled=?,
          pwd_expiry_days=?, pwdloginattempt=?, pinloginattempt=?
      WHERE bid=? AND mobile=?
    `;

    const values = [
      name,
      pwd,
      pin,
      status,
      enabled,
      pwd_expiry_days,
      pwdloginattempt,
      pinloginattempt,
      bid,
      mobile,
    ];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "buser not found" });

      // ✅ Return updated record
      db.query(
        "SELECT * FROM buser WHERE bid=? AND mobile=?",
        [bid, mobile],
        (err2, rows) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ message: "buser updated successfully", buser: rows[0] });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ DELETE buser
exports.deleteBUser = (req, res) => {
  const { bid, mobile } = req.params;
  db.query("DELETE FROM buser WHERE bid = ? AND mobile = ?", [bid, mobile], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "buser not found" });
    res.json({ message: "buser deleted successfully" });
  });
};

// ✅ SEARCH by name
exports.searchBUser = (req, res) => {
  const searchTerm = `%${req.params.term}%`;
  db.query("SELECT * FROM buser WHERE name LIKE ?", [searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
