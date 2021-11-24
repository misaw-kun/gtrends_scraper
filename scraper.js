import puppeteer from 'puppeteer';
const URL = "https://trends.google.com/trends/trendingsearches/daily?geo=IN";

const isButtonVisible = async (page, cssSelector) => {
    let visible = true;
    await page
      .waitForSelector(cssSelector, { visible: true, timeout: 1000 })
      .catch(() => {
        visible = false;
      });
    return visible;
  };

const scrape = async (page) => page.evaluate(() => {
    let story = document.querySelectorAll('.md-list-block');
    let stories = [];

    story.forEach(element => {
        let title = element.querySelector('.title a').textContent.trim();
        let url = element.querySelector('.summary-text a').getAttribute('href');
        let sourceAndTime = element.querySelector('.source-and-time').getAttribute('title');
        let source = sourceAndTime.split(' • ')[0];
        let time = sourceAndTime.split(' • ')[1];
        let searchCount = element.querySelector('.search-count-title').textContent;

        if(title != null && url != null) {
            stories.push({
                title,
                url,
                source,
                time,
                searchCount
            })
        }
    })

    return stories
})

export const getTrends = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle2'});

    console.log('starting crawl...');

    let loadMoreVisible = await isButtonVisible(page, '.feed-load-more-button');
    //autoclick "load more" till it disappears
    let trends = [];
    while(loadMoreVisible) {
        await page
            .click('.feed-load-more-button')
            .then(trends = await scrape(page))
            .catch(() => {});
        loadMoreVisible = await isButtonVisible(page, '.feed-load-more-button');
    }

    await browser.close();
    console.log('crawl completed!')
    return trends;
}
