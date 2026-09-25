'use strict';
// Load .env ourselves so "node server" works as well as "npm start".
const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '.env');
if (fs.existsSync(ENV_FILE)) {
  // values already set in the shell win over .env
  const before = { ...process.env };
  process.loadEnvFile(ENV_FILE);
  Object.assign(process.env, before);
}
