const fs = require('fs');
const path = require('path');

function findFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, files);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  });
  return files;
}

const targetDir = 'c:/Users/Vidhu/Documents/GitHub/miisky_project/frontend/src/pages/MasterSide';
const files = findFiles(targetDir);

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Pattern 1: setVar(data.results) -> setVar(data?.results || (Array.isArray(data) ? data : []))
  newContent = newContent.replace(/set([A-Za-z0-9]+)\(\s*([a-zA-Z0-9_]+)\.results\s*\)/g, 'set$1($2?.results || (Array.isArray($2) ? $2 : []))');
  
  // Pattern 2: var.length === 0 -> (!var || var.length === 0) 
  // Need to be careful not to match things that are already (!var || var.length === 0)
  // Let's do a negative lookbehind if possible or just use a replace function
  newContent = newContent.replace(/([A-Za-z0-9_]+)\.length\s*===?\s*0/g, function(match, p1, offset, string) {
    if (string.substring(offset - 6, offset).includes('!')) return match;
    if (string.substring(offset - 2, offset) === '||') return match;
    return `(!${p1} || ${p1}.length === 0)`;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
    console.log('Updated: ' + file);
  }
});

console.log('Updated ' + count + ' files.');
