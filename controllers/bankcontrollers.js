const db = require('../db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

// Add a new bank
exports.addBank = (req, res) => {
  let { id, name, address, sms_uid, sms_pwd, phone, cancel_mode } = req.body;
  id = id?.toUpperCase();
  name = name?.toUpperCase();
  address = address?.toUpperCase();

  const sql = 'INSERT INTO bank (id, name, address, sms_uid, phone, sms_pwd, cancel_mode) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [id, name, address, sms_uid, phone, sms_pwd, cancel_mode], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send({ message: 'Bank ID already exists' });
      }
      return res.status(500).send(err);
    }
    res.send({ message: 'Bank added successfully', result });
  });
};


// Get all banks
exports.getBanks = (req, res) => {
  db.query('SELECT * FROM bank', (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};



// Get a single bank by ID
exports.getBankById = (req, res) => {
  const bankId = req.params.id;
  const sql = 'SELECT * FROM bank WHERE id = ?';
  
  db.query(sql, [bankId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0)
      return res.status(404).send({ message: 'Bank not found' });
    
    res.send(results[0]); // return single object
  });
};


// Delete a bank by ID
// exports.deleteBank = (req, res) => {
//   const bankId = req.params.id;
//   const sql = 'DELETE FROM bank WHERE id = ?';
//   db.query(sql, [bankId], (err, result) => {
//     if (err) return res.status(500).send(err);
//     if (result.affectedRows === 0) return res.status(404).send({ message: 'Bank not found' });
//     res.send({ message: 'Bank deleted successfully' });
//   });
// };

// Update a bank by ID
exports.updateBank = (req, res) => {
  const bankId = req.params.id;
  let { name, address, sms_uid, sms_pwd,phone, cancel_mode } = req.body;

  name = name?.toUpperCase();
  address = address?.toUpperCase();
  
  const sql = `
    UPDATE bank 
    SET name = ?, address = ?, sms_uid = ?, sms_pwd = ?, cancel_mode = ?,phone=?
    WHERE id = ?
  `;
  db.query(sql, [name, address, sms_uid, sms_pwd, cancel_mode,phone, bankId], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send({ message: 'Bank not found' });
    res.send({ message: 'Bank updated successfully' });
  });
};

// Search banks by term
exports.searchBanks = (req, res) => {
  const searchTerm = `%${req.params.term}%`;
  const sql = `
    SELECT * FROM bank 
    WHERE name LIKE ? OR address LIKE ? OR sms_uid LIKE ? OR id LIKE ?
  `;
  db.query(sql, [searchTerm, searchTerm, searchTerm,searchTerm], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};




// Delete bank and all related records
// exports.deleteBank = async (req, res) => {
//   const { id } = req.params;

//   try {
//     // 1️⃣ Delete agents related to the bank
//     await query("DELETE FROM agent WHERE bid = ?", [id]);

//     // 2️⃣ Delete deposit codes related to the bank
//     await query("DELETE FROM depositcode WHERE bid = ?", [id]);

//     // 3️⃣ Delete SMS templates related to the bank
//     await query("DELETE FROM sms_template WHERE bid = ?", [id]);

//     // 4️⃣ Delete the bank itself
//     const result = await query("DELETE FROM bank WHERE id = ?", [id]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Bank not found" });
//     }

//     res.json({ message: "Bank and all related records deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting bank:", err);
//     res.status(500).json({ message: "Failed to delete bank" });
//   }
// };

exports.deleteBank = async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Check if any agents exist for the bank
    const agents = await query("SELECT COUNT(*) as count FROM agent WHERE bid = ?", [id]);
    if (agents[0].count > 0) {
      return res.status(400).json({ message: "Please delete all agents related to this bank first." });
    }

    // 2️⃣ Check if any deposit codes exist for the bank
    const depositCodes = await query("SELECT COUNT(*) as count FROM depositcode WHERE bid = ?", [id]);
    if (depositCodes[0].count > 0) {
      return res.status(400).json({ message: "Please delete all deposit codes related to this bank first." });
    }

    // 3️⃣ Check if any SMS templates exist for the bank
    const smsTemplates = await query("SELECT COUNT(*) as count FROM sms_template WHERE bid = ?", [id]);
    if (smsTemplates[0].count > 0) {
      return res.status(400).json({ message: "Please delete all SMS templates related to this bank first." });
    }

    // 4️⃣ Delete the bank itself
    const result = await query("DELETE FROM bank WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.json({ message: "Bank deleted successfully" });
  } catch (err) {
    console.error("Error deleting bank:", err);
    res.status(500).json({ message: "Failed to delete bank" });
  }
};

