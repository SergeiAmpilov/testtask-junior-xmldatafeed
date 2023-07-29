import { getPage } from "./page.service";
import { ParsedString, Product } from "./types";
import puppeteer, { Browser, Page } from 'puppeteer';





async function parseProductList(url: string, region?: string): Promise<Product[]> {

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page: Page = await getPage(browser, url, region);

  const products: Product[] = await page.evaluate(() => {

    const parsedProducts: Product[] = [];

    document
      .querySelectorAll('.product-card')
      .forEach((elCard) => {
        const name: ParsedString = elCard.querySelector('.product-name')?.innerHTML.toString().replace('\t', '').replace('\n', '').trim();
        const url: ParsedString = elCard.querySelector('.product-name')?.getAttribute('href');
        const price: ParsedString = elCard.querySelector('.price span span')?.innerHTML.toString().trim();
        const priceOld: ParsedString = elCard.querySelector('.price-discount')?.textContent?.toString().trim();

        parsedProducts.push({ name, url, price, priceOld });
      });

    return parsedProducts;

  });

  await browser.close();
  return products;

}


// run in process
process.on('message', async ({ url, region = '' }) => {
  const result: Product[] = await parseProductList(url, region);
  (<any> process).send(result);
  process.disconnect();
});