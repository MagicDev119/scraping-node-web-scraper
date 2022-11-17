require('dotenv').config()
const express = require('express')
const app = express()
const scraping = require('./scraping')
const routes = require('./routes/routes')
var cron = require('node-cron');
app.use(express.json())
app.use('/images', express.static(path.join(__dirname, './images')));
app.use('/api', routes)

cron.schedule('* * * * * *', () => {
  console.log('start-scraping')
  // scraping()
});

scraping()

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
})