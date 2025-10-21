const bcrypt = require("bcrypt");

const hashes = [
 "$2a$11$P/YmV5xu3OiA9m.Q0fbEwedOGb9ktPEwHIPHHq92BJlA/m1OghxHi"

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
