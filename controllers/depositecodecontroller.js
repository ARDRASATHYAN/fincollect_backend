const db = require('../db');

// exports.getdepositecode = (req, res) => {
//   db.query('SELECT * FROM depositcode', (err, results) => {
//     if (err) return res.status(500).send(err);
//     res.send(results);
//   });
// };
// GET /depositcode?bid=1&code=ABC&search=term
exports.getDepositCodes = (req, res) => {
  const { bid, code, search } = req.query;

  let sql = `SELECT * FROM depositcode WHERE 1=1`;
  const params = [];

  // Filter by Bank ID
  if (bid) {
    sql += ` AND bid = ?`;
    params.push(bid);
  }

  // Filter by Code
  if (code) {
    sql += ` AND code = ?`; // exact match; use LIKE if partial
    params.push(code);
  }

  // Optional search (partial match on description or code)
  if (search) {
    sql += ` AND (description LIKE ? OR code LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};


// CREATE new depositcode
exports.createdepositcode = async (req, res) => {
  try {
    let { bid, code, description, times, multiples,Stmt_Req } = req.body;

    // Capitalize code and description
    code = code?.toUpperCase();
    description = description?.toUpperCase();

    const sql = `
      INSERT INTO depositcode
      (bid, code, description, times, multiples,Stmt_Req)
      VALUES (?, ?, ?, ?, ?,?)
    `;

    const values = [bid, code, description, times, multiples,Stmt_Req];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({
        message: "Deposit code added successfully",
        id: result.insertId
      });
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



// DELETE deposit code by bid & code
exports.deleteDepositCode = (req, res) => {
  const { bid, code } = req.params; // get bid & code from URL

  const sql = `
    DELETE FROM depositcode
    WHERE bid = ? AND code = ?
  `;

  db.query(sql, [bid, code], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Deposit code not found' });
    res.json({ message: 'Deposit code deleted successfully' });
  });
};

// GET deposit codes by search term
exports.searchDepositCodes = (req, res) => {
  const term = `%${req.params.term}%`;
  const sql = `
    SELECT * FROM depositcode
    WHERE bid LIKE ? OR code LIKE ? OR description LIKE ?
  `;
  db.query(sql, [term, term, term], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// GET single deposit code by bid and code
exports.getDepositCodeById = (req, res) => {
  const { bid, code } = req.params;

  const sql = `
    SELECT * FROM depositcode
    WHERE bid = ? AND code = ?
  `;

  db.query(sql, [bid, code], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error", details: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Deposit code not found" });
    }

    res.json(results[0]); // send single object, not array
  });
};


// UPDATE deposit code (bid + code cannot change)
exports.updateDepositCode = (req, res) => {
  const { bid, code } = req.params;
  const { description, times, multiples, Stmt_Req } = req.body;

  const sql = `
    UPDATE depositcode
    SET description = ?, times = ?, multiples = ?, Stmt_Req = ?
    WHERE bid = ? AND code = ?
  `;
  db.query(sql, [description, times, multiples, Stmt_Req, bid, code], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Deposit code not found" });
    res.json({ message: "Deposit code updated successfully" });
  });
};


