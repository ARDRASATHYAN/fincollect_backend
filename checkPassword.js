const bcrypt = require("bcrypt");

const hashes = [
 "$2b$10$VbvM3S/k0.P6Ms4gZESxd.8KZ28aQCjzW5eLCSxtYDWbIJiVOUY5K"

];

const plaintext = "Apple@100";

async function checkHashes() {
  for (const hash of hashes) {
    const match = await bcrypt.compare(plaintext, hash);
    console.log(`Hash: ${hash}`);
    console.log(`Matches "${plaintext}"?`, match);
    console.log("----------------------------");
  }
}

checkHashes();
