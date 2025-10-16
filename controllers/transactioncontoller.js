
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
