const bcrypt = require('bcrypt');

async function generateHashes() {
  const saltRounds = 10;
  const passwords = ['password123', 'password456', 'password789', 'password101'];
  
  for (const password of passwords) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    console.log(`Password: ${password}`);
    console.log(`Salt: ${salt}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
}

generateHashes();
