import puppeteer, { Browser } from 'puppeteer';
import { URL_LIST } from './url.list';
import { ProductParser } from './parser/product.parser';
import { createObjectCsvWriter } from 'csv-writer';
const xl = require('excel4node');


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

  
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Sheet 2');


  

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const productParser: ProductParser = new ProductParser(URL_LIST, browser, csvWriter, ws);
  await productParser.parseProductList();
  await productParser.refillProducts();
  await productParser.makeCsv();
  productParser.storeXl();

  const productParserRostov: ProductParser = new ProductParser(URL_LIST, browser, csvWriter, ws, 'г Ростов-на-Дону');
  await productParserRostov.parseProductList();
  await productParserRostov.refillProducts();
  await productParserRostov.makeCsv();
  productParserRostov.storeXl();


  await browser.close();

  await wb.write(`data-${Math.floor(Date.now() / 1000)}.xls`);
  console.log('End   script', new Date().toLocaleString('ru-RU'));

}


init();