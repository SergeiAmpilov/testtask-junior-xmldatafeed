import { getPage } from "./page.service";
import { Product, ParsedString, BreadCrumb } from "./types";
import { Browser, Page } from 'puppeteer';
import { DOMAIN } from "./url.list";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';




async function parseProductCard(product: Product, region?: string): Promise<Product> {

  puppeteer.use(StealthPlugin());

  const { url } = product;

  if (!url) {
    return product;
  }

  const newProduct: Product = {...product};

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--proxy-server=78.110.195.242:7080']
  });

  const page: Page = await getPage(browser, url, region);

  // stock
  newProduct.stock = await page.evaluate(() => {
    return document.querySelector('.ok')?.textContent?.toString();
  });


  // img url list
  const imgUrlList = await page.evaluate(() => {    
    const arImg: ParsedString[] = [];    
    document
      .querySelector('.slick-list')?.querySelectorAll('.slick-slide .img-fluid').forEach((imgDomElement) => {
        let imgUrl: ParsedString = imgDomElement.getAttribute('src')?.toString();
        arImg.push(imgUrl ? imgUrl : '');
      })

    return arImg;
  });
  newProduct.imgUrl?.push(...imgUrlList);

  // breadCrumb
  const brCmb = await page.evaluate(() => {
    const bcListItems: BreadCrumb[] = [];
    document.querySelector('.breadcrumb')?.querySelectorAll('a.breadcrumb-item').forEach((el) => {
      bcListItems.push({
        url: el.getAttribute('href'),
        text: el.getAttribute('title'),
      });
    })
    return bcListItems;
  });

  newProduct.breadCrumbs = brCmb.map(({ url, text }) => {
    return {
      url: `${DOMAIN}${url}`,
      text,
    }
  });


  // region
  newProduct.region = await page.evaluate(() => {
    return document
            .querySelector('.top-location .select-city-link a')?.textContent?.toString()
            .replace('\t', '').replace('\n', '').trim();
  });

  await browser.close();

  return newProduct;

}


// run in process
process.on('message', async ({ product, region = '' }) => {
  const result: Product = await parseProductCard(product, region);
  (<any> process).send(result);
  process.disconnect();
});