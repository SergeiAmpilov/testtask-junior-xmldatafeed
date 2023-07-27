import puppeteer from 'puppeteer';
import { URL_LIST } from './url.list';
import { IProduct } from './item.interface';



async function init() {
  console.log('Start script', new Date().toLocaleString('ru-RU'));
  

  const productList: IProduct[] = [];
  

  for (const baseUrl of URL_LIST) {
    console.log(baseUrl);

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});

    await page.goto(baseUrl, {
      waitUntil: "domcontentloaded"
    });

    const result: IProduct[] = await page.evaluate(() => {

      let prod: IProduct[] = [];

      document
        .querySelectorAll('.product-card')
        .forEach((elCard) => 
        {

          const name = elCard.querySelector('.product-name')?.innerHTML.toString();          
          const url = elCard.querySelector('.product-name')?.getAttribute('href');
          const price = elCard.querySelector('.price span span')?.innerHTML;          

          prod.push({ name, url, price });          
        });

      return prod;

    });

    await browser.close();

    productList.push(...result);

  }

  console.log(productList.length);
  console.log(productList);
  console.log('End   script', new Date().toLocaleString('ru-RU'));
}


init();