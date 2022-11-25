const express = require('express')
const fs = require('fs')
var request = require("request")

const statusModel = require('../models/statusModel')
const vehicleModel = require('../models/vehicleModel')

const router = express.Router()
const statusPath = './pages/status.json'
router.get('/getVehicleList/:type', async (req, res) => {
  const type = req.params['type']

  let statusObject = await statusModel.findOne({ type: 'usedcarsni' })

  if (statusObject === null) {
    res.send({
      list: []
    })
  }
  const curListNum = statusObject.saved_cur_num
  let vehicleList

  if (type != 'scraping' && parseInt(type) != NaN) {
    vehicleList = await vehicleModel.find().skip(parseInt(type)).limit(10)
  } else {
    vehicleList = await vehicleModel.find().skip(curListNum).limit(10)

    statusObject.saved_cur_num = statusObject.saved_cur_num + 10
    await statusObject.save()
  }

  const listRes = vehicleList.map(each => {
    const eachPostMeta = each.post_meta.map(eachMeta => {
      if (eachMeta.label == 'Model') {
        eachMeta.make = each.post_meta.filter(eachFilter => eachFilter.label == 'Make')[0] ? each.post_meta.filter(eachFilter => eachFilter.label == 'Make')[0].value : undefined
      }

      if (eachMeta.label == 'Contact') {
        const arr = eachMeta.value.split('<br>')
        const phoneNumber = arr.map(eachNumber => {
          const num = eachNumber.match(/[0-9 ]*/gi)[0]
          return num + '  ' + eachNumber.split(num)[0]
        })

        eachMeta.value = phoneNumber.join(', ')
      }

      return eachMeta
    })

    each.post_meta = eachPostMeta

    return each
  })
  res.send({
    list: listRes
  })
})

var getWPPost = function (req, res) {
  var headers, options
  console.log('--------------')
  // Set the headers
  headers = {
    'Content-Type': 'application/json'
  }

  // Configure the request
  options = {
    url: 'https://magicdev119.nidigital.uk/wp-json/secret/v1/scraping/',
    method: 'GET',
    headers: headers
  }

  // Start the request
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('--2------------')
      res.send({
        success: true,
        message: "Successfully fetched a list of post",
        posts: JSON.parse(body)
      })
    } else {
      console.log(error)
      console.log('--1------------')
    }
  })
}

router.get('/test', function (req, res) {
  getWPPost(req, res)
})

router.get('/init-scraping', async function (req, res) {
  await statusModel.findOneAndUpdate(
    { type: 'usedcarsni' },
    {
      $set: {
        type: 'usedcarsni',
        scraping_cur_page: 1,
        scraped_total_page: 1
      }
    }
  )
})

router.get('/init-saving', async function (req, res) {
  await statusModel.findOneAndUpdate(
    { type: 'usedcarsni' },
    {
      $set: {
        saved_cur_num: 1
      }
    }
  )
})

router.get('/init-list', async function (req, res) {
  await vehicleModel.deleteMany({})
})

module.exports = router