
const fs = require('fs');
const path = require('path');

const gsPath = path.join(__dirname, 'google_apps_script.js');
const jsPath = path.join(__dirname, 'src', 'data', 'appsScriptCode.js');

const code = fs.readFileSync(gsPath, 'utf8');
const output = 'export const APPS_SCRIPT_CODE = `' + code + '`;\n';
fs.writeFileSync(jsPath, output, 'utf8');
console.log('Successfully synchronized appsScriptCode.js');
