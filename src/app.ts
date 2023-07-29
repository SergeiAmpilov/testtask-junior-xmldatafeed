import { Product, ProductPack } from "./types";
import { fork } from 'child_process';
import { URL_LIST } from "./url.list";




async function start() {

  const products: Product[] = [];

  const productPack: ProductPack[] = await Promise.all(URL_LIST.map((url) => parseProductListFork(url)));
  productPack.map((arr) => { products.push(...arr)});
  
  console.log(products);
  console.log(products.length);

}

start();



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