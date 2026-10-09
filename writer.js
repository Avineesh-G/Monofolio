const fs = require('fs');
const chunks = [];
global.add = (c) => chunks.push(c);
global.save = (dest) => fs.writeFileSync(dest, chunks.join('\n'), 'utf8');
