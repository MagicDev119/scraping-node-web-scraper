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

const scrapingFunc = async () => {
  https.get('https://gorest.co.in/public/v2/users', res => {
    let data = [];
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    console.log('Status Code:', res.statusCode);
    console.log('Date in Response header:', headerDate);

    res.on('data', chunk => {
      data.push(chunk);
    });

    res.on('end', () => {
      console.log('Response ended: ');
      console.log(Buffer.concat(data).toString())
      // const users = JSON.parse(Buffer.concat(data).toString());

      // for (user of users) {
      //   console.log(`Got user with id: ${user.id}, name: ${user.name}`);
      // }
    });
  }).on('error', err => {
    console.log('Error: ', err.message);
  });
  // axios.get('http://magicdev119.nidigital.uk/wp-json/secret/v1/scraping/')
  //   .then(response => {
  //     console.log(response.data == 'success' ? '123' : 'asd')
  //   })
  // return
  // const pages = [];//All ad pages.
  // let pageNum = 932;
  // //pageObject will be formatted as {title,phone,images}, becuase these are the names we chose for the scraping operations below.
  // //Note that each key is an array, because there might be multiple elements fitting the querySelector.
  // //This hook is called after every page finished scraping.
  // //It will also get an address argument. 
  // const getPageObject = (pageObject, address) => {
  //   pageObject.pageNum = pageNum
  //   pages.push(pageObject)
  // }

  // const getElementContent = (content, pageAddress) => {
  //   console.log('-----------------------------------contentElement')
  //   console.log(content)
  //   console.log('================================================')
  //   const contentElement = content.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)[2].split('-')
  //   console.log(contentElement)
  //   myDivs.push(contentElement[contentElement.length - 1])
  // }

  // const config = {
  //   baseSiteUrl: `https://www.usedcarsni.com`,
  //   startUrl: `https://www.usedcarsni.com/search_results.php?make=0&keywords=&fuel_type=0&trans_type=0&age_from=0&age_to=0&price_from=0&price_to=0&user_type=0&mileage_to=0&body_style=0&distance_enabled=0&distance_postcode=&homepage_search_attr=1&tab_id=0&search_type=1`,
  //   filePath: './images/',
  //   maxRetries: 1,
  //   logPath: './logs/'
  // }

  // const scraper = new Scraper(config);
  // while (true) {
  //   const root = new Root({ pagination: { queryString: 'pagepc0', begin: pageNum, end: pageNum } });//Open pages 1-10. You need to supply the querystring that the site uses(more details in the API docs).
  //   const pageManager = new CollectContent('nav.title-bar ul.pagination li', { name: 'hasNext' })
  //   const jobAds = new OpenLinks('article .car-description .car-caption .car-title div a', { name: 'list', getPageObject });//Opens every job ad, and calls the getPageObject, passing the formatted dictionary.

  //   const technicalHeaders = new CollectContent('.car-detail-info .technical-params .technical-headers', { name: 'technicalHeaders' });
  //   const technicalInfo = new CollectContent('.car-detail-info .technical-params .technical-info', { name: 'technicalInfo' });
  //   const carPriceTitle = new CollectContent('.car-detail-info .technical-params .car-price-box div:first-child', { name: 'carPriceTitle' });
  //   const carPrice = new CollectContent('.car-detail-header .car-detail-header__price-block div .car-detail-price__price', { name: 'carPrice' });
  //   const title = new CollectContent('.car-detail-header div h1 a', { name: 'title' });
  //   const carId = new CollectContent('.car-detail-header div h1', { contentType: 'html', name: 'carId' });
  //   const images = new DownloadContent('#carousel-slides .carousel-inner .item picture', { name: 'images', alternativeSrc: ['data-url'], filePath: './images/' + pageNum + '/' })
  //   root.addOperation(pageManager);
  //   root.addOperation(jobAds);
  //   jobAds.addOperation(title);
  //   jobAds.addOperation(carId);
  //   jobAds.addOperation(technicalHeaders);
  //   jobAds.addOperation(technicalInfo);
  //   jobAds.addOperation(carPriceTitle);
  //   jobAds.addOperation(carPrice);
  //   jobAds.addOperation(images);

  //   await scraper.scrape(root);

  //   const getPageManager = pageManager.getData()
  //   console.log('==============================', getPageManager)
  //   pageNum++;
  //   if (getPageManager[getPageManager.length - 1] !== 'Next')
  //     break;
  // }

  // pages.map(each => {
  //   const carIdMatch = each.carId[0].match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)[2].split('-')
  //   each.carId = carIdMatch[carIdMatch.length - 1]
  // })
  // fs.writeFile('./pages/pages.json', JSON.stringify(pages), () => {
  //   fs.writeFile('./pages/status.json', JSON.stringify({
  //     status: 'saving',
  //     current: 1
  //   }), () => {
  //     saveToDatabase(1, pages.length)
  //   });
  // });
}

module.exports = scrapingFunc