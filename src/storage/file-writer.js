const fs = require('fs');
const path = require('path');

/**
 * Safely writes data to a JSON file. Creates parent directories if they do not exist.
 * Uses Early Return pattern for directory checks.
 * @param {string} filepath Path to the destination file.
 * @param {any} data Data object to serialize.
 */
function writeJson(filepath, data) {
  const dir = path.dirname(filepath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  writeJson
};
