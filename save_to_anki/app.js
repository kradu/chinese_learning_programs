const express = require('express');
const ejs = require('ejs');
const csvHandler = require('./utils/csvHandler');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

const processEntryData = async (entry) => {
  if (entry !== ''){
    const entryLines = entry.split('\n');
    console.log('Entry Lines:', entryLines);
    
    for (const line of entryLines) {
      console.log('Processing Line:', line);
      
      if (line.trim() !== '') {
        const match = line.match(/\s*\(([^)]+)\)\s*-\s*(.*)/);
        
        if (match) {
          const [_, entryPinyin, entryMeaning] = match;
          const entryCharacter = line.split('(')[0].trim();
          
          // console.log('Character:', entryCharacter);
          // console.log('Pinyin:', entryPinyin);
          // console.log('Meaning:', entryMeaning);
          
          try {
            await csvHandler.appendToCSV(entryCharacter, entryPinyin.trim(), entryMeaning.trim());
            console.log('Entry appended to CSV');
          } catch (error) {
            console.error('Error appending entry to CSV:', error);
          }
        } else {
          console.log('No match found for line:', line);
        }
      }
    }
  };
  }
  


  const processArchEntryData = async (archEntry) => {
    const sanitizedArchEntry = archEntry.replace(/\r/g, '').replace(/\t/g, '');
    const archEntryLines = sanitizedArchEntry.split('\n').map(line => line.trim());
    console.log('Arch Entry Lines:', archEntryLines);
    
    for (let i = 0; i < archEntryLines.length; i++) {
      let character = archEntryLines[i];
      
      // Check if the next line contains traditional characters in parentheses
      if (i + 1 < archEntryLines.length && archEntryLines[i + 1].match(/^\(.*\)$/)) {
        const traditionalCharacters = archEntryLines[i + 1];
        character += ' ' + traditionalCharacters;
        i++; // Skip the next line since it has been included
      }
      
      // Check if the next line contains pinyin and meaning
      if (i + 1 < archEntryLines.length && archEntryLines[i + 1].match(/\[.*\]/)) {
        const pinyinMeaning = archEntryLines[i + 1];
        const match = pinyinMeaning.match(/\[\s*(.*?)\s*\]\s*(.*)/);
        
        if (match) {
          const [_, pinyin, meaning] = match;
          console.log('Arch Character:', character);
          console.log('Arch Pinyin:', pinyin.trim());
          console.log('Arch Meaning:', meaning.trim());
          
          try {
            await csvHandler.appendToCSV(character, pinyin.trim(), meaning.trim());
            console.log('Arch Entry appended to CSV');
          } catch (error) {
            console.error('Error appending arch entry to CSV:', error);
          }
        } else {
          console.log('Invalid arch entry format:', pinyinMeaning);
        }
        
        i++; // Skip the next line since it has been processed
      }
    }
  };
  

const addCharacterToCSV = async (character, pinyin, meaning) => {
  console.log('Character:', character);
  console.log('Pinyin:', pinyin);
  console.log('Meaning:', meaning);
  if((character !== '') && (pinyin !== '')  && (meaning !== '') ){
    try {
      await csvHandler.appendToCSV(character, pinyin, meaning);
      console.log('Character appended to CSV');
    } catch (error) {
      console.error('Error appending character to CSV:', error);
      throw error;
    }
  }
 
};

app.post('/add', async (req, res) => {
  const { character, pinyin, meaning, entry, archEntry } = req.body;
  
  console.log('Request Body:', req.body);
  
  try {
    await processArchEntryData(archEntry);
    await processEntryData(entry);
    await addCharacterToCSV(character, pinyin, meaning);
    res.redirect('/');
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});