import puppeteer, { Browser } from 'puppeteer';
import { URL_LIST } from './url.list';
import { ProductParser } from './parser/product.parser';
import { createObjectCsvWriter } from 'csv-writer';

async function init() {

  console.log('Start script', new Date().toLocaleString('ru-RU'));

  const filename = `data.csv`;

  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: [
      {id: 'name', title: 'NAME'},
      {id: 'region', title: 'REGION'},
      {id: 'breadCrumb', title: 'BREADCRUMB'},
      {id: 'price', title: 'PRICE'},
      {id: 'priceOld', title: 'PRICE-OLD'},
      {id: 'stock', title: 'STOCK'},
      {id: 'imgUrl', title: 'IMG-URL'},
      {id: 'url', title: 'URL'},
    ]
  });
  

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const productParser: ProductParser = new ProductParser(URL_LIST, browser, csvWriter);
  await productParser.parseProductList();
  await productParser.refillProducts();
  await productParser.makeCsv();

  const productParserRostov: ProductParser = new ProductParser(URL_LIST, browser, csvWriter, 'г Ростов-на-Дону');
  await productParserRostov.parseProductList();
  await productParserRostov.refillProducts();
  await productParserRostov.makeCsv();

  await browser.close();

  console.log('End   script', new Date().toLocaleString('ru-RU'));

}


init();