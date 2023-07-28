import puppeteer from 'puppeteer';
import { DOMAIN, ROOT_CATALOG, URL_LIST } from './url.list';
import { IProduct } from './item.interface';
import { processCsv } from './process-csv.function';


const getBrowser = () => {

}


async function init() {

  console.log('Start script', new Date().toLocaleString('ru-RU'));
    
  const productList: IProduct[] = [];

 
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  let page = await browser.newPage();
  await page.setViewport({width: 1920, height: 1080});

  // product list
  for (const baseUrl of URL_LIST) {

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

    const result: IProduct[] = await page.evaluate(() => {

      let prod: IProduct[] = [];      

      document
        .querySelectorAll('.product-card')
        .forEach((elCard) => 
        {
          const name = elCard.querySelector('.product-name')?.innerHTML.toString().replace('\t', '').replace('\n', '').trim();;          
          const url = elCard.querySelector('.product-name')?.getAttribute('href');
          const price = elCard.querySelector('.price span span')?.innerHTML.toString().trim();
          const priceOld = elCard.querySelector('.price-discount')?.textContent?.toString().trim()
          ;
          
          prod.push({ name, url, price, priceOld });          
        });

      return prod;
    });
    
    productList.push(...result);    
  }


  // go to product card
  for (const product of productList) {

    product.url = DOMAIN + product.url;
    await page.goto(product.url, { waitUntil: "domcontentloaded" });

    // stock
    product.stock = await page.evaluate(() => {
      return document.querySelector('.ok')?.textContent?.toString();
    })

    // img url list
    const imgUrlList = await page.evaluate(() => {
      const arImg: string[] = [];
      document
        .querySelector('.slick-list')?.querySelectorAll('.slick-slide .img-fluid').forEach((imgDomElement) => {
          let imgUrl = imgDomElement.getAttribute('src')?.toString();
          imgUrl = imgUrl ?? '';
          arImg.push(imgUrl);
        })

      return arImg;
    });

    product.imgUrl?.push(...imgUrlList);


    // breadCrumb
    product.breadCrumb = await page.evaluate(() => {
      const bcListItems: any[] = [];
      document.querySelector('.breadcrumb')?.querySelectorAll('a.breadcrumb-item').forEach((el) => {
        bcListItems.push({
          url: el.getAttribute('href'),
          text: el.getAttribute('title'),
        });
      })
      return bcListItems;
    });

    // region
    product.region = await page.evaluate(() => {
      return document
              .querySelector('.top-location .select-city-link a')?.textContent?.toString()
              .replace('\t', '').replace('\n', '').trim();
    });

  }

  await browser.close();
  
  console.log(productList);

  processCsv(productList);
  console.log('End   script', new Date().toLocaleString('ru-RU'));
}


init();