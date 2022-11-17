require('dotenv').config()
const express = require('express')
const app = express()
const scraping = require('./scraping')
const routes = require('./routes/routes')

app.use(express.json())

app.use('/api', routes)

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
})