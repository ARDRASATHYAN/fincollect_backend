const db = require("../db");

exports.getDashboardData = async (req, res) => {
  try {
    //  Fetch all banks
    const [banks] = await db.promise().query(`
      SELECT id, name 
      FROM bank
    `);

    //  Fetch all ACTIVE agents
    const [agents] = await db.promise().query(`
      SELECT id, bid, branch 
      FROM agent 
      WHERE status = 'A'
    `);

    // Get ONLY grand total of active agents' active transactions
    const [grandTotalResult] = await db.promise().query(`
      SELECT 
    SUM(t.amount) AS grand_total
FROM transaction t
INNER JOIN agent a 
        ON a.id = t.id
       AND a.bid = t.bid
WHERE a.status = 'A'
  AND t.status = 1;

    `);

    const grandTotal = Number(grandTotalResult[0].grand_total || 0);

    // Build bank,branch,agent structure (NO transaction totals)
    const banksData = banks.map((bank) => {
      const bankAgents = agents.filter((a) => a.bid === bank.id);

      // Count branches
      const branchMap = {};
      bankAgents.forEach((agent) => {
        branchMap[agent.branch] = (branchMap[agent.branch] || 0) + 1;
      });

      const branches = Object.keys(branchMap).map((branchName, index) => ({
        id: `${bank.id}-BR${index + 1}`,
        name: branchName || "Unnamed Branch",
        agents: branchMap[branchName],
      }));

      return {
        id: bank.id,
        name: bank.name,
        branches,
        totalAgents: bankAgents.length,
      };
    });

    // 5️⃣ Summary
    const summary = {
      totalBanks: banksData.length,
      totalBranches: banksData.reduce((a, b) => a + b.branches.length, 0),
      totalAgents: banksData.reduce((a, b) => a + b.totalAgents, 0),
      totalAmount: grandTotal, // ✅ Only this amount kept
      totalRevenue:banksData.length*2500,
    };

    // 6️⃣ Final Response
    res.json({
      summary,
      banks: banksData,
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
