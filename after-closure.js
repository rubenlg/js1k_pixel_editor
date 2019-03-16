const fs = require('fs');

const data = fs.readFileSync(0, 'utf8')
console.log(data
  .replace(`'use strict';`, '')
  .replace(/var /g, '')
  // Can't use /g here, otherwise it drops function arguments too.
  .replace(/,([a-zA-Z],)+/, ',')
  .replace('(1024)', '(32*32)')
  .replace(/\n/g, '')
  .replace(/\(\)=>/g, 'f=>')
  .replace(/;$/, '')
  );
