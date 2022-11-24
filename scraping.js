const { Scraper, Root, OpenLinks, CollectContent, DownloadContent } = require('nodejs-web-scraper')
const fs = require('fs')
const axios = require('axios')
const https = require('https')
const statusModel = require('./models/statusModel')
const vehicleModel = require('./models/vehicleModel')

const agent = new https.Agent({
  rejectUnauthorized: false
})

// function asyncFunction(item, cb) {
//   fs.writeFile('./pages/status.json', JSON.stringify({
//     status: 'saving',
//     current: item
//   }), () => {
//     axios.get('https://magicdev119.nidigital.uk/wp-json/secret/v1/scraping/', { httpsAgent: agent })
//       .then(response => {
//         if (response.data == 'success') {
//         }
//         cb()
//       })
//   })
// }

// const saveToDatabase = (start, total) => {
//   let requests = Array.from(Array(parseInt(total / 10) + (total % 10 !== 0 ? 1 : 0)).keys()).reduce((promiseChain, item) => {
//     return promiseChain.then(() => new Promise((resolve) => {
//       asyncFunction(item, resolve)
//     }))
//   }, Promise.resolve())

//   requests.then(() => {
//     fs.writeFile('./pages/status.json', JSON.stringify({
//       status: 'ready'
//     }), () => {
//       console.log('done')
//     })
//   })
// }

const scrapingFunc = async (pageStartNumber) => {
  // axios.get('https://localhost/wp-json/secret/v1/scraping/', { httpsAgent: agent })
  //   .then(response => {
  //     console.log(response.data == 'success' ? '123' : 'asd')
  //   })
  // return
  const pages = []//All ad pages.
  let pageNum = pageStartNumber
  //pageObject will be formatted as {title,phone,images}, becuase these are the names we chose for the scraping operations below.
  //Note that each key is an array, because there might be multiple elements fitting the querySelector.
  //This hook is called after every page finished scraping.
  //It will also get an address argument. 
  const getPageObject = (pageObject, address) => {
    pageObject.pageNum = pageNum
    pages.push(pageObject)
  }

  const getElementContent = (content, pageAddress) => {
    console.log('-----------------------------------contentElement')
    console.log(content)
    console.log('================================================')
    const contentElement = content.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)[2].split('-')
    console.log(contentElement)
    myDivs.push(contentElement[contentElement.length - 1])
  }

  const condition = async (cheerioNode) => {
    //Note that cheerioNode contains other useful methods, like html(), hasClass(), parent(), attr() and more.           
    const text = cheerioNode.attr('href')//Get the innerText of the <a> tag.
    console.log('===========================')
    console.log(text)
    const carIdMatch = text.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)[2].split('-')
    const carId = carIdMatch ? carIdMatch[carIdMatch.length - 1] : undefined

    let vehicleResult = await vehicleModel.findOne({ carId: carId })
    if (vehicleResult === null) {
      return true
    }
    vehicleResult.deleted = false
    await vehicleResult.save()
    // if (carId === 'some text i am looking for') {//Even though many links might fit the querySelector, Only those that have this innerText,
    //   // will be "opened".
    //   return true
    // }
  }

  const config = {
    baseSiteUrl: `https://www.usedcarsni.com`,
    startUrl: `https://www.usedcarsni.com/search_results.php?make=0&keywords=&fuel_type=0&trans_type=0&age_from=0&age_to=0&price_from=0&price_to=0&user_type=0&mileage_to=0&body_style=0&distance_enabled=0&distance_postcode=&homepage_search_attr=1&tab_id=0&search_type=1`,
    filePath: './images/',
    maxRetries: 1,
    cloneFiles: false,
    logPath: './logs/'
  }

  const scraper = new Scraper(config)
  let pageCount = 1
  let isLastPage = false
  while (true) {
    const root = new Root({ pagination: { queryString: 'pagepc0', begin: pageNum, end: pageNum } })//Open pages 1-10. You need to supply the querystring that the site uses(more details in the API docs).
    const pageManager = new CollectContent('nav.title-bar ul.pagination li', { name: 'hasNext' })
    const jobAds = new OpenLinks('article .car-description .car-caption .car-title div a', { name: 'list', getPageObject, condition })//Opens every job ad, and calls the getPageObject, passing the formatted dictionary.

    const technicalHeaders = new CollectContent('.car-detail-info .technical-params .technical-headers', { name: 'technicalHeaders' })
    const technicalInfo = new CollectContent('.car-detail-info .technical-params .technical-info', { name: 'technicalInfo' })
    const carPriceTitle = new CollectContent('.car-detail-info .technical-params .car-price-box div:first-child', { name: 'carPriceTitle' })
    const carPrice = new CollectContent('.car-detail-header .car-detail-header__price-block div .car-detail-price__price', { name: 'carPrice' })
    const title = new CollectContent('.car-detail-header div h1 a', { name: 'title' })
    const carId = new CollectContent('.car-detail-header div h1', { contentType: 'html', name: 'carId' })
    const contactInfo = new CollectContent('.car-detail-info .technical-params .technical-info address .dealer_phone', { name: 'contactInfo' })
    const curHtml = new CollectContent('html', { contentType: 'html', name: 'curHtml' })
    const images = new DownloadContent('#carousel-slides .carousel-inner .item picture', { name: 'images', alternativeSrc: ['data-url'], filePath: './images/' + pageNum + '/' })
    root.addOperation(pageManager)
    root.addOperation(jobAds)
    jobAds.addOperation(title)
    jobAds.addOperation(carId)
    jobAds.addOperation(technicalHeaders)
    jobAds.addOperation(technicalInfo)
    jobAds.addOperation(carPriceTitle)
    jobAds.addOperation(contactInfo)
    jobAds.addOperation(curHtml)
    jobAds.addOperation(carPrice)
    jobAds.addOperation(images)

    await scraper.scrape(root)

    const getPageManager = pageManager.getData()
    console.log('==============================', getPageManager)
    pageNum++
    pageCount++
    if (pageCount >= 1) {
      break
    }
    if (getPageManager[getPageManager.length - 1] !== 'Next') {
      isLastPage = true
      break
    }
  }

  // fs.readFile('./pages/pages-' + pageNum + '.json', 'utf8', (err, pageList) => {
  //   let prevList = []
  //   try {
  //     if (err) console.log('aaaaaaa')
  //     else if (pageList == '') console.log('bbbbbbbbbbbb')
  //     else prevList = JSON.parse(pageList)
  //   } catch (e) {
  //     prevList = []
  //   }
  //   const curPages = [...prevList, ...pages]

  await Promise.all(
    pages.map(async (eachPage, index) => {
      const carIdMatch = eachPage.carId[0] ? each.carId[0].match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)[2].split('-') : undefined
      const carId = carIdMatch ? carIdMatch[carIdMatch.length - 1] : undefined

      let post_meta = [{
        label: "Gallery",
        value: []
      }]
      let flag = false
      let content = ''
      console.log(eachPage.carPrice)
      if (eachPage.carPrice.length >= 1) {
        post_meta.push({
          label: 'Price',
          value: parseInt(eachPage.carPrice[0].match(/[0-9]/gi).join(''))
        })
      }

      if (eachPage.contactInfo.length >= 1) {
        post_meta.push({
          label: 'Contact',
          value: eachPage.contactInfo.join('<br>')
        })
      }
      eachPage.technicalHeaders.forEach((eachTechParam, index) => {
        if (eachTechParam === 'Seller') {
          flag = true
        }

        if (!flag) {
          post_meta.push({
            label: eachTechParam,
            value: eachPage.technicalInfo[index]
          })
        } else {
          if (eachTechParam === 'Description') {
            content = eachPage.technicalInfo[index]
          }
          // if (eachTechParam === 'Contact') {
          //   post_meta.push({
          //     label: eachTechParam,
          //     value: eachPage.technicalInfo[index]
          //   })
          // }
        }
      })

      let pageHtml = eachPage.curHtml.substr(eachPage.curHtml.indexOf("adHandler.service.setTargeting('Model'") + "adHandler.service.setTargeting('Model'".length)
      pageHtml = pageHtml.substr(0, pageHtml.indexOf("')"))
      const model = pageHtml.substr(pageHtml.indexOf("'") + 1)

      if (model != "") {
        post_meta.push({
          label: 'Model',
          value: model
        })
      }

      pageHtml = eachPage.curHtml.substr(eachPage.curHtml.indexOf("adHandler.service.setTargeting('Make'") + "adHandler.service.setTargeting('Make'".length)
      pageHtml = pageHtml.substr(0, pageHtml.indexOf("')"))
      const make = pageHtml.substr(pageHtml.indexOf("'") + 1)

      if (make != "") {
        post_meta.push({
          label: 'Make',
          value: make
        })
      }
      const newVehicle = await new vehicleModel({
        carId: carId,
        title: eachPage.title[0],
        post_meta: post_meta,
        post: {
          post_content: content,
          post_title: eachPage.title[0],
          post_status: 'publish',
          post_type: 'vehica_car',
          images: eachPage.images,
          page_num: eachPage.pageNum
        },
      }).save()
      return newVehicle
    })
  )

  if (!isLastPage) {
    await statusModel.findOneAndUpdate(
      { type: 'usedcarsni' },
      {
        $set: {
          scraping_cur_page: pageNum,
          scraped_total_page: pageNum
        }
      }
    )

    scrapingFunc(pageNum)
  } else {
    await statusModel.findOneAndUpdate(
      { type: 'usedcarsni' },
      {
        $set: {
          scraping_cur_page: 1,
          scraped_total_page: pageNum
        }
      }
    )
  }
  // fs.writeFile('./pages/current.json', pageNum + '', () => {
  //   fs.writeFile('./pages/pages-' + pageNum + '.json', JSON.stringify(pages), () => {
  //     if (!isLastPage) {
  //       fs.writeFile('./pages/total.json', pageNum + '', () => {
  //         scrapingFunc(pageNum)
  //       })
  //     } else {
  //       fs.writeFile('./pages/current.json', '1', () => {
  //         fs.writeFile('./pages/total.json', pageNum + '', () => {
  //         })
  //       })
  //     }
  //   })
  // })
}

const startScraping = async () => {
  let statusObject = await statusModel.findOne({ type: 'usedcarsni' })
  if (statusObject === null) {
    await new statusModel({
      type: 'usedcarsni',
      scraping_cur_page: 1,
      scraped_total_page: 1,
      saved_cur_num: 1
    }).save()

    await vehicleModel.updateMany({}, { deleted: true })

    scrapingFunc(1)
  } else {
    scrapingFunc(statusObject.scraping_cur_page)
  }
}

module.exports = startScraping