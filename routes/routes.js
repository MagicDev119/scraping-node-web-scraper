const express = require('express');
const fs = require('fs');
var request = require("request");

const router = express.Router()
const dataPath = './pages/pages.json';
const statusPath = './pages/status.json';
router.get('/getVehicleList', (req, res) => {
  fs.readFile(statusPath, 'utf8', (err, status) => {
    // const statusObject = JSON.parse(status)
    const statusObject = {
      status: 'working'
    }

    if (statusObject.status == 'saving') {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
        const limitData = JSON.parse(data).splice(statusObject.current * 10, 10)
        const dataList = JSON.parse(limitData).map(each => {
          let post_meta = [{
            label: "Gallery",
            value: []
          }];
          let flag = false;
          content = '';
          console.log(each.carPrice)
          if (each.carPrice.length >= 1) {
            post_meta.push({
              label: 'Price',
              value: each.carPrice[0]
            })
          }
          each.technicalHeaders.forEach((eachTechParam, index) => {
            if (eachTechParam === 'Seller') {
              flag = true
            }

            if (!flag) {
              post_meta.push({
                label: eachTechParam,
                value: each.technicalInfo[index]
              })
            } else {
              if (eachTechParam === 'Description') {
                content = each.technicalInfo[index]
              }
              if (eachTechParam === 'Contact') {
                post_meta.push({
                  label: eachTechParam,
                  value: each.technicalInfo[index]
                })
              }
            }
          })
          return {
            post: {
              post_content: content,
              post_title: each.title[0],
              post_status: 'publish',
              post_type: 'vehica_car',
              images: each.images,
              page_num: each.pageNum
            },
            post_meta: post_meta
          }
        })

        res.send(dataList);
      });
    } else {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
        const dataList = JSON.parse(data).map(each => {
          let post_meta = [{
            label: "Gallery",
            value: []
          }];
          let flag = false;
          content = '';
          console.log(each.carPrice)
          if (each.carPrice.length >= 1) {
            post_meta.push({
              label: 'Price',
              value: each.carPrice[0]
            })
          }
          each.technicalHeaders.forEach((eachTechParam, index) => {
            if (eachTechParam === 'Seller') {
              flag = true
            }

            if (!flag) {
              post_meta.push({
                label: eachTechParam,
                value: each.technicalInfo[index]
              })
            } else {
              if (eachTechParam === 'Description') {
                content = each.technicalInfo[index]
              }
              if (eachTechParam === 'Contact') {
                post_meta.push({
                  label: eachTechParam,
                  value: each.technicalInfo[index]
                })
              }
            }
          })
          return {
            post: {
              post_content: content,
              post_title: each.title[0],
              post_status: 'publish',
              post_type: 'vehica_car',
              images: each.images,
              page_num: each.pageNum
            },
            post_meta: post_meta
          }
        })

        res.send(dataList);
      });
    }
  });
})

var getWPPost = function (req, res) {
  var headers, options;
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
      });
    } else {
      console.log(error);
      console.log('--1------------')
    }
  });
};

router.get('/test', function (req, res) {
  getWPPost(req, res);
})

module.exports = router;