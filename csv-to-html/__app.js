const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

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
    .on('data', (data) => {
      console.log('Parsed row:', data);
      results.push(data);
    })
    .on('error', (err) => {
      console.error('Error parsing CSV:', err);
      res.status(500).send('Error parsing CSV');
    })
    .on('end', () => {
      let html = `
        <html>
          <body>
            <form id="feedbackForm">
              <table>
                <tr>
                  <th>Word</th>
                  <th>Feedback</th>
                </tr>
      `;

      for (const row of results) {
        // const word = row.character ;
        // console.log('Processing word:', word);
        for (const row of results) {
            console.log(`printing ${JSON.stringify(row)}`)
            html += '<tr>';
            for (const value of Object.values(row)) {
              html += `<td>${value}</td>`;
            }
            html += `
            <td>
              <button type="button" onclick="recordFeedback('${row}', 1)">1</button>
              <button type="button" onclick="recordFeedback('${row}', 2)">2</button>
              <button type="button" onclick="recordFeedback('${row}', 3)">3</button>
              <button type="button" onclick="recordFeedback('${row}', 4)">4</button>
            </td>
        `;
            html += '</tr>';
          }
        // 
      }

      html += `
              </table>
              <button type="submit">Submit</button>
            </form>
            <script>
              const feedbackData = {};

              function recordFeedback(word, rating) {
                feedbackData[word] = rating;
              }

              document.getElementById('feedbackForm').addEventListener('submit', (event) => {
                event.preventDefault();
                fetch('/saveFeedback', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(feedbackData)
                })
                  .then(response => response.text())
                  .then(data => {
                    alert(data);
                  })
                  .catch(error => {
                    console.error('Error saving feedback:', error);
                    alert('Error saving feedback');
                  });
              });
            </script>
          </body>
        </html>
      `;

      res.send(html);
    });
});

app.post('/saveFeedback', (req, res) => {
  const feedbackData = req.body;
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp}\n${JSON.stringify(feedbackData)}\n\n`;

  fs.appendFile('feedback.log', logEntry, (err) => {
    if (err) {
      console.error('Error saving feedback:', err);
      res.status(500).send('Error saving feedback');
    } else {
      console.log('Feedback saved successfully');
      res.send('Feedback saved successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});