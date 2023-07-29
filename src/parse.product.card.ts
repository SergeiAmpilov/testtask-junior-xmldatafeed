import { getPage } from "./page.service";
import { Product, ParsedString, BreadCrumb } from "./types";
import puppeteer, { Browser, Page } from 'puppeteer';
import { DOMAIN } from "./url.list";



async function parseProductCard(product: Product, region?: string): Promise<Product> {

  const { url } = product;

  if (!url) {
    return product;
  }

  const newProduct: Product = {...product};

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
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