const express = require('express');
const fs = require('fs');

const router = express.Router()
const dataPath = './pages/pages.json';
router.get('/getVehicleList', (req, res) => {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }

    res.send(JSON.parse(data));
  });
})

module.exports = router;