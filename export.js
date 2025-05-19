const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const fs2 = require('fs').promises;
// Path to your EJS template
const templatePath = path.join(__dirname, 'views', 'index.ejs');
const danhsachtemplatePath = path.join(__dirname, 'views', 'danhsach.ejs');



// Output path for HTML file
let outputPath = path.join(__dirname, 'dist', 'index.html');


async function readJsonFilesFromFolder(folderPath) {
  try {
    const files = await fs2.readdir(folderPath);
 
    const jsonFiles = files.filter(file => file.endsWith('.txt'));

    const dataList = await Promise.all(
      jsonFiles.map(async file => {
        try{
          const filePath = path.join(folderPath, file);
          const content = await fs2.readFile(filePath, 'utf-8');
          return JSON.parse(content);
        }
        catch(err){
          console.error('Error reading file:', file);
        }
       
      })
    );

    return dataList;
  } catch (err) {
    console.error('Error reading files:', err);
    return [];
  }
}


function toSlug(str) {
  return str
    .normalize('NFD')                      // Convert to Unicode Normalization Form
    .replace(/[\u0300-\u036f]/g, '')       // Remove Vietnamese accents
    .replace(/đ/g, 'd')                    // Replace đ
    .replace(/Đ/g, 'D')                    // Replace Đ
    .toLowerCase()                         // Convert to lowercase
    .trim()                                // Remove surrounding spaces
    .replace(/[^a-z0-9\s-]/g, '')          // Remove invalid chars
    .replace(/\s+/g, '-')                  // Replace spaces with -
    .replace(/-+/g, '-');                  // Replace multiple dashes with single dash
}

readJsonFilesFromFolder('./datas').then(dataList => {
  console.log('JSON data list:', dataList.length);
  // OR with for...of loop
  for (const [index, data] of dataList.entries()) {
    console.log(`\nFile ${index + 1}:`);
    console.log(data);
    if(data){
    // Render EJS and write to index.html
      let urlFile = toSlug(data.meta.title);
      outputPath = path.join(__dirname, 'dist', `${urlFile}.html`);

      ejs.renderFile(templatePath, data, (err, str) => {
        if (err) {
          console.error('Error rendering EJS:', err);
        } else {
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, str);
          console.log('index.html has been generated in /dist');
        }
      });
    }

  }
  var dataFinal = [];
  for (const [index, data] of dataList.entries()) {
    try {
      if(data){
        let urlFile = toSlug(data.meta.title);
        data.slug = urlFile; 
        dataFinal.push(data);
      }
    
    } catch (error) {
    }
    
  }
  outputPath = path.join(__dirname, 'dist', `danhsach.html`);

  ejs.renderFile(danhsachtemplatePath,{ items: dataFinal } , (err, str) => {
    if (err) {
      console.error('Error rendering EJS:', err);
    } else {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, str);
      console.log('index.html has been generated in /dist');
    }
  });


});
