require('dotenv').config()
const express = require('express')
const app = express()
const scraping = require('./scraping')
const path = require('path')
const routes = require('./routes/routes')
const fs = require('fs');
var cron = require('node-cron');
app.use(express.json())
app.use('/images', express.static(path.join(__dirname, './images')));
app.use('/api', routes)

cron.schedule('00 00 12 * * 0-6', () => {
  const dataPath = './pages/status.json';
  // fs.readFile(dataPath, 'utf8', (err, data) => {
  // const statusResult = JSON.parse(data);
  // if (statusResult.status == 'ready') {
  // fs.writeFile('./pages/status.json', JSON.stringify({
  // status: 'working'
  // }), () => { });

  fs.writeFile('./pages/pages.json', JSON.stringify([]), () => {
    scraping(1)
  });
  // }
  // })
});

fs.writeFile('./pages/pages.json', JSON.stringify([]), () => {
  scraping(1)
});

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
})