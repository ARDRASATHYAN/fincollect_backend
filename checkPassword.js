const bcrypt = require("bcrypt");

const hashes = [
 "$2b$10$OlluTgoocpTs40sYM4QCQe8fv.fOG3FDBeA34NB/CRaKKprvE84ga"

];

const plaintext = "welcome";

async function checkHashes() {
  for (const hash of hashes) {
    const match = await bcrypt.compare(plaintext, hash);
    console.log(`Hash: ${hash}`);
    console.log(`Matches "${plaintext}"?`, match);
    console.log("----------------------------");
  }
}

checkHashes();
