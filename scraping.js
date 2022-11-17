const { Scraper, Root, OpenLinks, CollectContent, DownloadContent } = require('nodejs-web-scraper');
const fs = require('fs');

module.exports = async () => {

  const pages = [];//All ad pages.
  let pageNum = 1;
  //pageObject will be formatted as {title,phone,images}, becuase these are the names we chose for the scraping operations below.
  //Note that each key is an array, because there might be multiple elements fitting the querySelector.
  //This hook is called after every page finished scraping.
  //It will also get an address argument. 
  const getPageObject = (pageObject, address) => {
    pages.push(pageObject)
  }

  const getElementContent = (content, pageAddress) => {
    var contentElement = content.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i)[2].split('-')
    myDivs.push({
      carId: contentElement[contentElement.length - 1]
    })
  }

  const config = {
    baseSiteUrl: `https://www.usedcarsni.com`,
    startUrl: `https://www.usedcarsni.com/search_results.php?make=0&keywords=&fuel_type=0&trans_type=0&age_from=0&age_to=0&price_from=0&price_to=0&user_type=0&mileage_to=0&body_style=0&distance_enabled=0&distance_postcode=&homepage_search_attr=1&tab_id=0&search_type=1`,
    filePath: './images/',
    logPath: './logs/'
  }

  const scraper = new Scraper(config);
  while (true) {
    const root = new Root({ pagination: { queryString: 'pagepc0', begin: pageNum, end: pageNum } });//Open pages 1-10. You need to supply the querystring that the site uses(more details in the API docs).
    const pageManager = new CollectContent('nav.title-bar ul.pagination li:last-child', { name: 'hasNext' })
    const jobAds = new OpenLinks('article .car-description .car-caption .car-title div a', { name: 'list', getPageObject });//Opens every job ad, and calls the getPageObject, passing the formatted dictionary.

    const technicalHeaders = new CollectContent('.car-detail-info .technical-params .technical-headers', { name: 'technicalHeaders' });
    const technicalInfo = new CollectContent('.car-detail-info .technical-params .technical-info', { name: 'technicalInfo' });
    const carPriceTitle = new CollectContent('.car-detail-info .technical-params .car-price-box div:first-child', { name: 'carPriceTitle' });
    const carPrice = new CollectContent('.car-detail-info .technical-params .car-price-box div:last-child', { name: 'carPrice' });
    const title = new CollectContent('.car-detail-header div h1 a', { name: 'title' });
    const carId = new CollectContent('.car-detail-header div h1', { getElementContent });
    // const images = new DownloadContent('#carousel-slides .carousel-inner .item picture', { name: 'images', alternativeSrc: ['data-url'], filePath: './images/' + pageNum + '/' })
    root.addOperation(pageManager);
    root.addOperation(jobAds);
    jobAds.addOperation(title);
    jobAds.addOperation(carId);
    jobAds.addOperation(technicalHeaders);
    jobAds.addOperation(technicalInfo);
    jobAds.addOperation(carPriceTitle);
    jobAds.addOperation(carPrice);

    await scraper.scrape(root);

    const getPageManager = pageManager.getData()
    console.log('==============================', getPageManager)
    pageNum++;
    if (pageNum > 1)
      break;
  }

  fs.writeFile('./pages/pages.json', JSON.stringify(pages), () => { });
}