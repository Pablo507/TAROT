const fs = require('fs');
const path = require('path');

const domain = 'https://www.tarotgratis.online';
const projectRoot = __dirname;

const filesToProcess = [
  { filePath: path.join(projectRoot, 'index.html'), url: domain + '/' }
];

['articulos', 'significado'].forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  if (fs.existsSync(dirPath)) {
    const subDirs = fs.readdirSync(dirPath).filter(sd => fs.statSync(path.join(dirPath, sd)).isDirectory());
    subDirs.forEach(subDir => {
      filesToProcess.push({
        filePath: path.join(dirPath, subDir, 'index.html'),
        url: `${domain}/${dir}/${subDir}/`
      });
    });
  }
});

filesToProcess.forEach(({ filePath, url }) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if canonical already exists
    if (!content.includes('rel="canonical"')) {
      const canonicalTag = `<link rel="canonical" href="${url}" />\n</head>`;
      content = content.replace('</head>', canonicalTag);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Added canonical to ${filePath} -> ${url}`);
    } else {
      console.log(`Canonical already exists in ${filePath}`);
    }
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

console.log('Finished processing canonical tags.');
