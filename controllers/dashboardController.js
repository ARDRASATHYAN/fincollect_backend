const db = require("../db");

exports.getDashboardData = async (req, res) => {
  const [banks] = await db.promise().query("SELECT id, name FROM bank");
  const [agents] = await db.promise().query("SELECT bid, branch FROM agent where status='A'");

  const banksData = banks.map((bank) => {
    const bankAgents = agents.filter((a) => a.bid === bank.id);
    const branchMap = {};

    bankAgents.forEach((a) => {
      if (!branchMap[a.branch]) branchMap[a.branch] = 0;
      branchMap[a.branch]++;
    });

    const branches = Object.keys(branchMap).map((b, i) => ({
      id: `${bank.id}-BR${i + 1}`,
      name: b || "Unnamed Branch",
      agents: branchMap[b],
    }));

    return {
      id: bank.id,
      name: bank.name,
      branches,
      totalAgents: bankAgents.length,
    };
  });

  const summary = {
    totalBanks: banksData.length,
    totalBranches: banksData.reduce((a, b) => a + b.branches.length, 0),
    totalAgents: banksData.reduce((a, b) => a + b.totalAgents, 0),
  };

  res.json({ summary, banks: banksData });
};

