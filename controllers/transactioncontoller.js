
const db = require("../db");

exports.getTransactionsByAgent = (req, res) => {
  const { bid, id } = req.params; 

  const sql = `
    SELECT * 
    FROM transaction 
    WHERE bid = ? AND id = ? 
  `;

  db.query(sql, [bid, id], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!results.length) {
      return res.status(404).json({ error: "No transactions found for this agent" });
    }

    res.json(results); 
  });
};


// controllers/transactionController.js
exports.restoreTransaction = (req, res) => {
  const { bid, id } = req.params;

  const checkSql = "SELECT COUNT(*) AS cnt FROM transaction WHERE bid = ? AND id = ?";
  db.query(checkSql, [bid, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const count = result[0].cnt;
    if (count > 0) {
      return res.status(400).json({ error: "Transaction table should be empty before restoring previous data" });
    }

    const insertSql = `
      INSERT INTO transaction (bid, id, tdate, rno, code, no, amount, status, txn_type, txn_timestamp)
      SELECT bid, id, tdate, rno, code, no, amount, status, txn_type, txn_timestamp
      FROM transaction_log
      WHERE bid = ? AND id = ? AND tdate >= (
        SELECT * FROM (
          SELECT MAX(tdate) FROM transaction_log
          WHERE bid = ? AND id = ? AND rno = 1
        ) AS tmp
      )
    `;
    db.query(insertSql, [bid, id, bid, id], (err2, result2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      return res.json({ message: "Transactions restored successfully!" });
    });
  });
};

