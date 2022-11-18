const express = require('express');
const fs = require('fs');

const router = express.Router()
const dataPath = './pages/pages.json';
const statusPath = './pages/status.json';
router.get('/getVehicleList', (req, res) => {
  fs.readFile(statusPath, 'utf8', (err, status) => {
    const statusObject = JSON.parse(status)
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

module.exports = router;