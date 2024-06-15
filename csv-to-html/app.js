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
          <h1>${req.file.originalname}
            <form id="feedbackForm">
              <table>
                <tr>
                  <th>Word</th>
                  <th>Feedback</th>
                  <th>Pinyin</th>
                  <th>Meaning</th>
                </tr>
      `;

      for (const row of results) {
        html += '<tr>';
        html += `<td>${row.Character}</td>`;
        html += `
          <td>
            <button type="button" onclick="recordFeedback('${row.Character}', 1)">1</button>
            <button type="button" onclick="recordFeedback('${row.Character}', 2)">2</button>
            <button type="button" onclick="recordFeedback('${row.Character}', 3)">3</button>
            <button type="button" onclick="recordFeedback('${row.Character}', 4)">4</button>
          </td>
        `;
        html += `<td>${row.Pinyin}</td>`;
        html += `<td>${row.Meaning}</td>`;
        html += '</tr>';
      }

      html += `
              </table>
              <button type="submit">Submit</button>
            </form>
            <script>
                const feedbackData = {};

                function recordFeedback(word, rating) {
                    feedbackData[word] = rating;
                    console.log('Feedback recorded:', feedbackData);

                }

                console.log('Feedback form element:', document.getElementById('feedbackForm'));
                document.getElementById('feedbackForm').addEventListener('submit', (event) => {
                    event.preventDefault();
                    console.log('Sending feedback data:', feedbackData);
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


app.post('/saveFeedback', saveFeedback);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});