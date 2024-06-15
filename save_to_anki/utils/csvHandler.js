const fs = require('fs');
const { stringify } = require('csv-stringify');

const csvFilename = `data_${Date.now()}.csv`;

// Create the CSV file with the header row
fs.writeFileSync(csvFilename, 'Character,Pinyin,Meaning\n');

async function appendToCSV(character, pinyin, meaning) {
  const data = [[character, pinyin, meaning]];

  return new Promise((resolve, reject) => {
    stringify(data, (err, csvData) => {
      if (err) {
        reject(err);
      } else {
        fs.appendFile(csvFilename, csvData, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

module.exports = {
  appendToCSV
};