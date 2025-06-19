
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { execSync } = require('child_process');

const env = dotenv.config({ path: '.env' });
dotenvExpand.expand(env);

const port = process.env.NEXT_PORT || 3000;

execSync(`npx next start -p ${port}`, { stdio: 'inherit' });
