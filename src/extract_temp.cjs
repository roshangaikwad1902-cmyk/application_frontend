const fs = require('fs');
const content = fs.readFileSync('../../scratch/repair_app_v3.js', 'utf8');
const searchString = "const cleanReceptionAndEdit = `";
const startIndex = content.indexOf(searchString) + searchString.length;
const endIndex = content.lastIndexOf("`;");
const extracted = content.substring(startIndex, endIndex);
fs.writeFileSync('extracted.ts', extracted);
