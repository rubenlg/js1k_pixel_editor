const fs = require('fs');

const data = fs.readFileSync(0, 'utf8')
console.log(data
  // Drop "use strict", so we can also drop var declarations
  .replace(`'use strict';`, '')
  // Drop all var declarations, leave raw assignments.
  .replace(/var /g, '')
  // After dropping var declarations, some uninitialized variables will remain.
  // For example var x=5,y,z,k=6 converts to x=5,y,z,k=6 and that will fail at
  // runtime. We drop the dangling variables without initializations.
  // Can't use /g here, otherwise it drops function arguments too.
  .replace(/,([a-zA-Z],)+/, ',')
  // Since we use the number 32 so often, it compresses better to express 32*32
  // than 1024.
  .replace('(1024)', '(32*32)')
  // Drop line breaks.
  .replace(/\n/g, '')
  // Convert arrow functions without params to arrow functions with an unused
  // param. "f" is shorter than ().
  .replace(/\(\)=>/g, 'f=>')
  // Drop the semicolon at the very end.
  .replace(/;$/, '')
  );
