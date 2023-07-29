import { getPage } from "./page.service";
import { ParsedString, Product } from "./types";
import { Browser, Page } from 'puppeteer';
import { DOMAIN } from "./url.list";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';






async function parseProductList(url: string, region?: string): Promise<Product[]> {

  puppeteer.use(StealthPlugin());

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--proxy-server=78.110.195.242:7080']
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

  return products.map((prod) => {
    return {
      ...prod,
      url: `${DOMAIN}${prod.url}`
    }
  });

}


// run in process
process.on('message', async ({ url, region = '' }) => {
  const result: Product[] = await parseProductList(url, region);
  (<any> process).send(result);
  process.disconnect();
});