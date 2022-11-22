const { Scraper, Root, OpenLinks, CollectContent, DownloadContent } = require('nodejs-web-scraper');
const fs = require('fs');
const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

function asyncFunction(item, cb) {
  fs.writeFile('./pages/status.json', JSON.stringify({
    status: 'saving',
    current: item
  }), () => {
    axios.get('https://magicdev119.nidigital.uk/wp-json/secret/v1/scraping/', { httpsAgent: agent })
      .then(response => {
        if (response.data == 'success') {
        }
        cb();
      })
  });
}

const saveToDatabase = (start, total) => {
  let requests = Array.from(Array(parseInt(total / 10) + (total % 10 !== 0 ? 1 : 0)).keys()).reduce((promiseChain, item) => {
    return promiseChain.then(() => new Promise((resolve) => {
      asyncFunction(item, resolve);
    }));
  }, Promise.resolve());

  requests.then(() => {
    fs.writeFile('./pages/status.json', JSON.stringify({
      status: 'ready'
    }), () => {
      console.log('done')
    });
  })
}

const scrapingFunc = async (pageStartNumber) => {
  // axios.get('https://localhost/wp-json/secret/v1/scraping/', { httpsAgent: agent })
  //   .then(response => {
  //     console.log(response.data == 'success' ? '123' : 'asd')
  //   })
  // return
  const pages = [];//All ad pages.
  let pageNum = pageStartNumber;
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

  const config = {
    baseSiteUrl: `https://www.usedcarsni.com`,
    startUrl: `https://www.usedcarsni.com/search_results.php?make=0&keywords=&fuel_type=0&trans_type=0&age_from=0&age_to=0&price_from=0&price_to=0&user_type=0&mileage_to=0&body_style=0&distance_enabled=0&distance_postcode=&homepage_search_attr=1&tab_id=0&search_type=1`,
    filePath: './images/',
    maxRetries: 1,
    logPath: './logs/'
  }

  const scraper = new Scraper(config);
  let pageCount = 1;
  let isLastPage = false;
  while (true) {
    const root = new Root({ pagination: { queryString: 'pagepc0', begin: pageNum, end: pageNum } });//Open pages 1-10. You need to supply the querystring that the site uses(more details in the API docs).
    const pageManager = new CollectContent('nav.title-bar ul.pagination li', { name: 'hasNext' })
    const jobAds = new OpenLinks('article .car-description .car-caption .car-title div a', { name: 'list', getPageObject });//Opens every job ad, and calls the getPageObject, passing the formatted dictionary.

    const technicalHeaders = new CollectContent('.car-detail-info .technical-params .technical-headers', { name: 'technicalHeaders' });
    const technicalInfo = new CollectContent('.car-detail-info .technical-params .technical-info', { name: 'technicalInfo' });
    const carPriceTitle = new CollectContent('.car-detail-info .technical-params .car-price-box div:first-child', { name: 'carPriceTitle' });
    const carPrice = new CollectContent('.car-detail-header .car-detail-header__price-block div .car-detail-price__price', { name: 'carPrice' });
    const title = new CollectContent('.car-detail-header div h1 a', { name: 'title' });
    const carId = new CollectContent('.car-detail-header div h1', { contentType: 'html', name: 'carId' });
    const images = new DownloadContent('#carousel-slides .carousel-inner .item picture', { name: 'images', alternativeSrc: ['data-url'], filePath: './images/' + pageNum + '/' })
    root.addOperation(pageManager);
    root.addOperation(jobAds);
    jobAds.addOperation(title);
    jobAds.addOperation(carId);
    jobAds.addOperation(technicalHeaders);
    jobAds.addOperation(technicalInfo);
    jobAds.addOperation(carPriceTitle);
    jobAds.addOperation(carPrice);
    jobAds.addOperation(images);

    await scraper.scrape(root);

    const getPageManager = pageManager.getData()
    console.log('==============================', getPageManager)
    pageNum++;
    pageCount++;
    if (pageCount >= 100) {
      break;
    }
    if (getPageManager[getPageManager.length - 1] !== 'Next') {
      isLastPage = true;
      break;
    }
  }

  pages.map(each => {
    const carIdMatch = each.carId[0] ? each.carId[0].match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)[2].split('-') : undefined
    each.carId = carIdMatch ? carIdMatch[carIdMatch.length - 1] : undefined
  })

  fs.readFile('./pages/pages.js', 'utf8', (err, pageList) => {
    let prevList = [];
    try {
      if (err) console.log('aaaaaaa')
      else if (pageList == '') console.log('bbbbbbbbbbbb')
      else prevList = JSON.parse(pageList)
    } catch (e) {
      prevList = [];
    }
    pages = [...pageList, ...pages]

    fs.writeFile('./pages/pages.json', JSON.stringify(pages), () => {
      if (!isLastPage) {
        scrapingFunc(pageNum)
      }
      // fs.writeFile('./pages/status.json', JSON.stringify({
      //   status: 'saving',
      //   current: 1
      // }), () => {
      //   saveToDatabase(1, pages.length)
      // });
    });
  })

}

module.exports = scrapingFunc