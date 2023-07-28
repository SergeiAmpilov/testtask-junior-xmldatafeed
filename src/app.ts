import puppeteer, { Browser } from 'puppeteer';
import { DOMAIN, ROOT_CATALOG, URL_LIST } from './url.list';
import { IProduct } from './item.interface';
import { processCsv } from './process-csv.function';
import { ProductParser } from './parser/product.parser';


async function init() {

  console.log('Start script', new Date().toLocaleString('ru-RU'));

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });


  const productParser: ProductParser = new ProductParser(URL_LIST, browser);
  await productParser.parseProductList();
  await productParser.refillProducts();
  await productParser.makeCsv('main');

  await browser.close();

  console.log('End   script', new Date().toLocaleString('ru-RU'));


}


init();