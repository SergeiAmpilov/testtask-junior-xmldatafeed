import { Product, ProductPack } from "./types";
import { fork } from 'child_process';
import { MAX_STREAMS_COUNT, URL_LIST } from "./url.list";
import { createObjectCsvWriter } from 'csv-writer';
import xl from 'excel4node';






async function start() {


  const productsBase = await runParse();
  const productsRostov = await runParse('г Ростов-на-Дону');


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
  const ws = wb.addWorksheet('Sheet 1');

  await makeCsv(productsBase, csvWriter);
  await makeCsv(productsRostov, csvWriter);

  makeXls(productsBase, ws);
  makeXls(productsRostov, ws);

  await wb.write(`data-${Math.floor(Date.now() / 1000)}.xls`);

}

start();

async function makeCsv(productList, csvWriter) {
  for (const row of productList) {
    await csvWriter.writeRecords([{
      name: row.name,
      region: row.region,
      breadCrumb: JSON.stringify(row.breadCrumb),
      price: row.price,
      priceOld: row.priceOld,
      stock: row.stock,
      imgUrl: JSON.stringify(row.imgUrl),
      url: row.url,
    }]);
  }
}

function makeXls(productList, worksheet) {
  for (let index = 0; index < productList.length; index++) {
    const element = productList[index];
    const row = index + 1;

    worksheet.cell(row, 1).string(element.name ?? '');
    worksheet.cell(row, 2).string(element.region ?? '');
    worksheet.cell(row, 3).string(element.price ?? '');
    worksheet.cell(row, 4).string(element.priceOld ?? '');
    worksheet.cell(row, 5).string(element.stock ?? '');
    worksheet.cell(row, 6).string(element.url ?? '');

    let col = 7;

    if (element.breadCrumb?.length) {
      for (const bc of element.breadCrumb) {          
        worksheet.cell(row, col).string(bc.text ?? '');
        col++;
        worksheet.cell(row, col).string(bc.url ?? '');
        col++;
      }
    }

    if (element.imgUrl?.length) {
      for (const imgUrl of element.imgUrl) {
        worksheet.cell(row, col).string(imgUrl ?? '');
        col++;
      }
    }
  }
}


async function runParse(region?: string): Promise<Product[]> {
  const products: Product[] = [];
  const productsRefilled: Product[] = [];

  const productPack: ProductPack[] = await Promise.all(URL_LIST.map((url) => parseProductListFork(url, region)));
  productPack.map((arr) => { products.push(...arr)});
  
  // refill product cards by chunk  
  for (let i = 0; i < products.length; i += MAX_STREAMS_COUNT) {
    const productsChunk: Product[] = products.slice(i, i + MAX_STREAMS_COUNT);

    const productPackRefilled: ProductPack = await Promise.all(productsChunk.map(
      (product: Product) => parseProductCard(product, region)
    ));

    productsRefilled.push(...productPackRefilled);
  }

  return productsRefilled;
}



function parseProductListFork(url: string, region?: string): Promise<ProductPack> {
  return new Promise((resolve, reject) => {
    const forkProcess = fork('./dist/parse.product.list.js');
    forkProcess.send({ url, region });

    forkProcess.on('message', (msg: Product[]) => {
      resolve(msg);
    });

    forkProcess.on('error', (err) => {
      reject(err);
    });
  });
}


function parseProductCard(product: Product, region?: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    const forkProcess = fork('./dist/parse.product.card.js');
    forkProcess.send({ product, region });

    forkProcess.on('message', (msg: Product) => {
      resolve(msg);
    });

    forkProcess.on('error', (err) => {
      reject(err);
    });
  });

}