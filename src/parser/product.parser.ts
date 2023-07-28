import { Browser } from "puppeteer";
import { createObjectCsvWriter } from 'csv-writer';
import { IProduct } from "../item.interface";
import { DOMAIN } from "../url.list";




export class ProductParser {

  private _products: IProduct[];

  constructor(
    private readonly urlList: string[],
    private readonly browser: Browser,
  ) {

    this._products = [];
  }


  public async parseProductList() {
    
    let page = await this.browser.newPage();

    for (const baseUrl of this.urlList) {

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
      
      this._products.push(...result);    
    }

    page.close();
  }

  /* refill products from cards */
  public async refillProducts() {

    let page = await this.browser.newPage();

    for (const product of this._products) {

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

    page.close();
  }

  public async makeCsv(prefix?: string) {

    const filename = (prefix ? `${prefix}-` : '') + `data-${Math.floor(Date.now()/1000)}.csv`;

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
  
  
    for (const row of this._products) {
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



  get products() {
    return this._products;
  }
}