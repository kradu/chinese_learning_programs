const fs = require('fs');

function saveFeedback(req, res) {
  console.log('Received feedback data:', req.body);

  const feedbackData = req.body;
  const timestamp = new Date().toISOString();
  let logEntry = `${timestamp}\n`;

  console.log('Feedback data:', feedbackData);

  for (const word in feedbackData) {
    logEntry += `${word}: ${feedbackData[word]}\n`;
  }

  console.log('Log entry:', logEntry);

  logEntry += '\n';

  fs.appendFile('feedback.log', logEntry, (err) => {
    if (err) {
      console.error('Error saving feedback:', err);
      res.status(500).send('Error saving feedback');
    } else {
      console.log('Feedback saved successfully');
      res.send('Feedback saved successfully');
    }
  });
}

module.exports = saveFeedback;