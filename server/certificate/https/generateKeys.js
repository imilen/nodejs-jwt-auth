const fs = require('fs');
const path = require('path');
const jksJs = require('jks-js');

module.exports = function extractFromKS() {

    const keyStoreFile = fs.readFileSync(path.join(__dirname, './server.ks'))
    const { server } = jksJs.toPem(keyStoreFile, '');

    return server;
}