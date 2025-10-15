const db = require('../db');

// Add a new bank
exports.addSmsTemplate = (req, res) => {
  const { bid,tname,tid,msg } = req.body;
  const sql = 'INSERT INTO sms_template(bid,tname,tid,msg) VALUES (?, ?, ?, ?)';
  db.query(sql, [bid,tname,tid,msg], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Bank added successfully', result });
  });
};

// Get all banks
// exports.getSmsTemplate = (req, res) => {
//   db.query('SELECT * FROM sms_template', (err, results) => {
//     if (err) return res.status(500).send(err);
//     res.send(results);
//   });
// };
exports.getSmsTemplate = (req, res) => {
  const { bid, tname, search } = req.query; // filters & search
  let sql = 'SELECT * FROM sms_template WHERE 1=1';
  const params = [];

  // Filter by Bank ID
  if (bid) {
    sql += ' AND bid = ?';
    params.push(bid);
  }

  // Filter by Template Name
  if (tname) {
    sql += ' AND tname = ?';
    params.push(tname);
  }

  // Search by ID (partial match)
  if (search) {
    sql += ' AND tid LIKE ?';
    params.push(`%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};


// GET single deposit code by bid and code
exports.getSmsTemplateById = (req, res) => {
  const { bid, tname } = req.params;

  const sql = `
    SELECT * FROM sms_template
    WHERE bid = ? AND tname = ?
  `;

  db.query(sql, [bid, tname], (err, results) => {
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


// DELETE deposit code by bid & code
exports.deleteSmsTemplate = (req, res) => {
  const { bid, tname } = req.params;

  const sql = `
    DELETE FROM sms_template
    WHERE bid = ? AND tname = ?
  `;

  db.query(sql, [bid, tname], (err, result) => {
    if (err)
      return res.status(500).json({ error: 'Database error', details: err });

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'SMS template not found' });

    res.json({ message: 'SMS template deleted successfully' });
  });
};


// GET deposit codes by search term
exports.searchSmsTemplate = (req, res) => {
  const term = `%${req.params.term}%`;
  const sql = `
    SELECT * FROM sms_template
    WHERE bid LIKE ? OR tname LIKE ? OR tid LIKE ?
  `;
  db.query(sql, [term, term, term], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};



// UPDATE deposit code (bid + code cannot change)
exports.updateSmsTemplate = (req, res) => {
  const { bid, tname } = req.params;
  const { tid, msg } = req.body;

  const sql = `
    UPDATE sms_template
    SET tid = ?, msg = ?
    WHERE bid = ? AND tname = ?
  `;
  db.query(sql, [tid, msg, bid, tname], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Deposit code not found" });
    res.json({ message: "Deposit code updated successfully" });
  });
};

