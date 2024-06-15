const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const saveFeedback = require('./saveFeedback');

const app = express();
const port = 3001;

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Serve the HTML form
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input type="file" name="csvFile" accept=".csv">
          <input type="submit" value="Upload">
        </form>
      </body>
    </html>
  `);
});

// Handle the file upload
app.post('/upload', upload.single('csvFile'), (req, res) => {
  const results = [];

  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let html = '<table>';
      html += '<tr>';
      for (const header of Object.keys(results[0])) {
        html += `<th>${header}</th>`;
      }
      html += '</tr>';

      for (const row of results) {
        html += '<tr>';
        for (const value of Object.values(row)) {
          html += `<td>${value}</td>`;
        }
        html += '</tr>';
      }

      html += '</table>';
      res.send(html);
    });
});

app.post('/saveFeedback', saveFeedback);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});