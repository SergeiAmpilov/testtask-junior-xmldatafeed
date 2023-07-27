import puppeteer from 'puppeteer';
import { IProduct } from './item.interface';
import { URL_LIST } from './url.list';



async function init() {
  console.log('Start script', new Date().toLocaleString('ru-RU'));
  

  const productList: IProduct[] = [];
  const baseUrl = 'https://www.toy.ru/catalog/boy_transport/';

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

    


    await browser.close();
  }
  
  
  console.log('End   script', new Date().toLocaleString('ru-RU'));
}


init();