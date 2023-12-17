const fs = require('fs');

const basepath = 'C://ProgramData/Music_Organizer';

function checkConfig() {
    if (fs.existsSync(`${basepath}/config.json`)) {
        const config = JSON.parse(fs.readFileSync(`${basepath}/config.json`, 'utf8'));
        return config;
    } else {
        return null;
    }
}

function saveConfig(config) {
    fs.writeFile(`${basepath}/config.json`, JSON.stringify(config), 'utf8', (err) => console.log(err));
}

module.exports = { checkConfig, saveConfig }
