const fs = require('fs');
const path = require('path');

function fixLineEndings(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixLineEndings(filePath);
      return;
    }

    if (file.match(/\.(ts|js|json|yml|yaml|md)$/)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixedContent = content.replace(/\r\n/g, '\n');
      fs.writeFileSync(filePath, fixedContent);
      console.log(`Fixed line endings in ${filePath}`);
    }
  });
}

const srcDir = path.join(__dirname, '..', 'src');
fixLineEndings(srcDir);
