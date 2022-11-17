const { Scraper, Root, OpenLinks, CollectContent, DownloadContent } = require('nodejs-web-scraper');
const fs = require('fs');

module.exports = async () => {

  const pages = [];//All ad pages.

  //pageObject will be formatted as {title,phone,images}, becuase these are the names we chose for the scraping operations below.
  //Note that each key is an array, because there might be multiple elements fitting the querySelector.
  //This hook is called after every page finished scraping.
  //It will also get an address argument. 
  const getPageObject = (pageObject, address) => {
    pages.push(pageObject)
  }

  const config = {
    baseSiteUrl: `https://www.usedcarsni.com`,
    startUrl: `https://www.usedcarsni.com/search_results.php?make=0&keywords=&fuel_type=0&trans_type=0&age_from=0&age_to=0&price_from=0&price_to=0&user_type=0&mileage_to=0&body_style=0&distance_enabled=0&distance_postcode=&homepage_search_attr=1&tab_id=0&search_type=1`,
    filePath: './images/',
    logPath: './logs/'
  }

  const scraper = new Scraper(config);

  const root = new Root();//Open pages 1-10. You need to supply the querystring that the site uses(more details in the API docs).

  const jobAds = new OpenLinks('.list-row h2 a', { name: 'Ad page', getPageObject });//Opens every job ad, and calls the getPageObject, passing the formatted dictionary.

  const phones = new CollectContent('.details-desc a.tel', { name: 'phone' })//Important to choose a name, for the getPageObject to produce the expected results.

  const titles = new CollectContent('h1', { name: 'title' });

  root.addOperation(jobAds);
  jobAds.addOperation(titles);
  jobAds.addOperation(phones);

  await scraper.scrape(root);

  fs.writeFile('./pages/pages.json', JSON.stringify(pages), () => { });
}