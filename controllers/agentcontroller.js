
const db = require('../db');
const bcrypt = require("bcryptjs");
// GET all agents

// exports.getAllAgents = (req, res) => {
//   db.query('SELECT * FROM agent', (err, results) => {
//     if (err) return res.status(500).send(err);
//     res.send(results);
//   });
// };


// GET all agents, optionally filter by bank ID and search term
exports.getAllAgents = (req, res) => {
  const { bid, search } = req.query; // get query params

  let sql = `SELECT * FROM agent WHERE 1=1`; // always true
  const params = [];

  // Filter by bank ID
  if (bid) {
    sql += ` AND bid = ?`;
    params.push(bid);
  }

  // Optional search by name, branch, or id
  if (search) {
    sql += ` AND (name LIKE ? OR branch LIKE ? OR id LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};




// CREATE new agent


exports.createAgent = async (req, res) => {
  try {
    let {
      bid, branch, mobile, id, name, mname,
      pwd, pin, status, enabled,
      pwd_expiry_days, pwdloginattempt, pinloginattempt,
      collection_status, print_required, sms_required
    } = req.body;

    branch = branch?.toUpperCase();
    id = id?.toUpperCase();
    name = name?.toUpperCase();
    mname = mname?.toUpperCase();

    const hashedPwd = await bcrypt.hash(pwd, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    // ✅ Check for duplicate primary key
    const checkIdSql = `SELECT * FROM agent WHERE CONCAT(bid, '-', id) = ?`;
    db.query(checkIdSql, [`${bid}-${id}`], (err, idResult) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (idResult.length > 0) {
        return res.status(400).json({ error: `Agent with ID '${bid}-${id}' already exists!` });
      }

      // ✅ Check for duplicate mobile
      const checkMobileSql = `SELECT * FROM agent WHERE mobile = ?`;
      db.query(checkMobileSql, [mobile], (err, mobileResult) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (mobileResult.length > 0) {
          return res.status(400).json({ error: `Mobile number '${mobile}' is already used!` });
        }

        // ✅ Insert agent
        const insertSql = `
          INSERT INTO agent
          (bid, branch, mobile, id, name, mname, pwd, pin, status, enabled, pwd_expiry_days, pwdloginattempt, pinloginattempt, collection_status, print_required, sms_required)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          bid, branch, mobile, id, name, mname,
          hashedPwd, hashedPin, status, enabled ? 1 : 0,
          pwd_expiry_days, pwdloginattempt, pinloginattempt,
          collection_status ? 1 : 0, print_required ? 1 : 0, sms_required ? 1 : 0
        ];

        db.query(insertSql, values, (err, result) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ error: "Database error" });
          }
          res.status(201).json({
            message: "Agent added successfully",
            id: `${bid}-${id}`
          });
        });

      }); // end mobile check
    }); // end ID check

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





// GET agent by bank ID and agent ID
exports.getAgentById = (req, res) => {
  const { bid, id } = req.params;

  const sql = 'SELECT * FROM agent WHERE bid = ? AND id = ?';
  db.query(sql, [bid, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!results.length) return res.status(404).json({ error: 'Agent not found' });

    const agent = {
      ...results[0],
      enabled: results[0].enabled === 1,
      collection_status: results[0].collection_status === 1,
      print_required: results[0].print_required === 1,
      sms_required: results[0].sms_required === 1
    };

    res.json(agent);
  });
};




exports.updateAgent = async (req, res) => {
  const { bid, id } = req.params;
  let {
    branch, mobile, name, mname,
    pwd, pin, status, enabled,
    collection_status, print_required, sms_required,
    pwd_expiry_days, pwdloginattempt, pinloginattempt
  } = req.body;

  branch = branch?.toUpperCase();
    name = name?.toUpperCase();
    mname = mname?.toUpperCase();

  if (!req.body) return res.status(400).json({ error: "No data provided" });

  try {
    const saltRounds = 10;

    // Fetch existing agent first
    const [existing] = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM agent WHERE bid = ? AND id = ?", [bid, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    if (!existing) return res.status(404).json({ error: "Agent not found" });

    // Only hash if password/PIN is provided and not already hashed
    if (pwd && !pwd.startsWith("$2b$")) {
      pwd = await bcrypt.hash(pwd, saltRounds);
    } else {
      pwd = existing.pwd; // keep existing
    }

    if (pin && !pin.startsWith("$2b$")) {
      pin = await bcrypt.hash(pin, saltRounds);
    } else {
      pin = existing.pin; // keep existing
    }

    const sql = `
      UPDATE agent
      SET branch = ?, mobile = ?, name = ?, mname = ?,
          pwd = ?, pin = ?, status = ?, enabled = ?,
          collection_status = ?, print_required = ?, sms_required = ?,
          pwd_expiry_days = ?, pwdloginattempt = ?, pinloginattempt = ?
      WHERE bid = ? AND id = ?
    `;

    const values = [
      branch, mobile, name, mname,
      pwd, pin, status, enabled,
      collection_status, print_required, sms_required,
      pwd_expiry_days, pwdloginattempt, pinloginattempt,
      bid, id
    ];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: "Database error", details: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Agent not found" });
      res.json({ message: "Agent updated successfully" });
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};







// exports.getAgentById = (req, res) => {
//   const { id } = req.params;

//   const sql = 'SELECT * FROM agent WHERE id = ?';
//   db.query(sql, [id], (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: 'Database error' });
//     }

//     if (!results.length) {
//       return res.status(404).json({ error: 'Agent not found' });
//     }

//     // Convert 0/1 fields back to boolean
//     const agent = {
//       ...results[0],
//       enabled: results[0].enabled === 1,
//       collection_status: results[0].collection_status === 1,
//       print_required: results[0].print_required === 1,
//       sms_required: results[0].sms_required === 1
//     };

//     res.json(agent);
//   });
// };




// // UPDATE agent
// exports.updateAgent = (req, res) => {
//   const { id } = req.params;
//   const {
//     bid, branch, mobile, name, mname,
//     pwd, pin, status, enabled,
//     pwd_expiry_days, pwdloginattempt, pinloginattempt,
//     collection_status, print_required, sms_required
//   } = req.body;

//   const sql = `
//     UPDATE agent
//     SET bid = ?, branch = ?, mobile = ?, name = ?, mname = ?,
//         pwd = ?, pin = ?, status = ?, enabled = ?,
//         pwd_expiry_days = ?, pwdloginattempt = ?, pinloginattempt = ?,
//         collection_status = ?, print_required = ?, sms_required = ?
//     WHERE id = ?
//   `;

//   const values = [
//     bid, branch, mobile, name, mname,
//     pwd, pin, status, enabled ? 1 : 0,
//     pwd_expiry_days, pwdloginattempt, pinloginattempt,
//     collection_status ? 1 : 0, print_required ? 1 : 0, sms_required ? 1 : 0,
//     id
//   ];

//   db.query(sql, values, (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Agent not found" });
//     }

//     res.json({ message: "Agent updated successfully" });
//   });
// };

// // DELETE agent
exports.deleteAgent = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM agent WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ message: 'Agent deleted successfully' });
  });
};




exports.searchAgents = (req, res) => {
  const searchTerm = `%${req.params.term}%`;
  const sql = `
    SELECT * FROM agent WHERE 
        name LIKE ? OR 
        id LIKE ? OR 
        branch LIKE ?
  `;
  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};



// exports.searchAgents = async (req, res) => {
//   const { q } = req.query; // search query

//   // If no query, return all agents
//   const sql = q
//     ? `SELECT * FROM agent WHERE 
//         name LIKE ? OR 
//         id LIKE ? OR 
//         branch LIKE ?`
//     : `SELECT * FROM agent`;

//   const values = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

//   db.query(sql, values, (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: 'Database error' });
//     }
//     res.json(results);
//   });
// };

