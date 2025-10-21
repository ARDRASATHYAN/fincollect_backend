const bcrypt = require("bcrypt");

const hashes = [
 "$2b$10$XYHgf5dMcDEOJuwrk87cl.1FGXbhd0H5MdgirpCjDtQF1HFCd.eu6","$2b$10$G2BJkvELMaBoiMwE/3BH6O96SswEa5RX/ptRmZrz4hbcwhc9av0kO"

];

const plaintext = "WELCOME";

async function checkHashes() {
  for (const hash of hashes) {
    const match = await bcrypt.compare(plaintext, hash);
    console.log(`Hash: ${hash}`);
    console.log(`Matches "${plaintext}"?`, match);
    console.log("----------------------------");
  }
}

checkHashes();
