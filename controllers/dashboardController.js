const db = require("../db");

exports.getDashboardData = async (req, res) => {
  try {
    // Fetch all banks
    const [banks] = await db.promise().query(`
      SELECT id, name 
      FROM bank
    `);

    //  Fetch only ACTIVE agents
    const [agents] = await db.promise().query(`
      SELECT id, bid, branch 
      FROM agent 
      WHERE status = 'A'
    `);

    // Fetch total transaction per ACTIVE agent
    const [amounts] = await db.promise().query(`
      SELECT 
        t.id,
        COALESCE(SUM(CAST(t.amount AS DECIMAL(15,2))), 0) AS total_amount
      FROM transaction t
      INNER JOIN agent a ON a.id = t.id
      WHERE a.status = 'A'
      GROUP BY t.id
    `);

    // amountMap
    const amountMap = {};
    amounts.forEach(row => {
      amountMap[row.id] = Number(row.total_amount);
    });

    // 4️⃣ Build response structure bank → branches → agents
    const banksData = banks.map((bank) => {
      // All active agents for this bank
      const bankAgents = agents.filter(a => a.bid === bank.id);

      const branchMap = {};          // { branchName: agentCount }
      const branchAmountMap = {};    // { branchName: totalAmount }

      // Loop through agents of this bank
      bankAgents.forEach((agent) => {
        const agentAmount = amountMap[agent.id] || 0;

        // Count agents per branch
        if (!branchMap[agent.branch]) branchMap[agent.branch] = 0;
        branchMap[agent.branch]++;

        // Sum transaction amount per branch
        if (!branchAmountMap[agent.branch]) branchAmountMap[agent.branch] = 0;
        branchAmountMap[agent.branch] += agentAmount;
      });

      // Build branch objects
      const branches = Object.keys(branchMap).map((branchName, index) => ({
        id: `${bank.id}-BR${index + 1}`,
        name: branchName || "Unnamed Branch",
        agents: branchMap[branchName],
        totalAmount: Number(branchAmountMap[branchName] || 0),
      }));

      // Total amount for entire bank
      const totalBankAmount = branches.reduce(
        (sum, b) => sum + b.totalAmount,
        0
      );

      return {
        id: bank.id,
        name: bank.name,
        branches,
        totalAgents: bankAgents.length,
        totalAmount: totalBankAmount,
      };
    });

    // 5️⃣ Dashboard Summary
    const summary = {
      totalBanks: banksData.length,
      totalBranches: banksData.reduce((a, b) => a + b.branches.length, 0),
      totalAgents: banksData.reduce((a, b) => a + b.totalAgents, 0),
      totalAmount: banksData.reduce((a, b) => a + b.totalAmount, 0),
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
