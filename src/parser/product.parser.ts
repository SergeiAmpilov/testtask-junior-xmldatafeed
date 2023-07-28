import { Browser, Page } from "puppeteer";
import { createObjectCsvWriter } from 'csv-writer';
import { IProduct } from "../item.interface";
import { DOMAIN } from "../url.list";




export class ProductParser {

  private _products: IProduct[];

  constructor(
    private readonly urlList: string[],
    private readonly browser: Browser,
    private readonly csvWriter,
    private worksheet,
    private region?: string,
  ) {

    this._products = [];
  }


  public async parseProductList() {
    
    for (const baseUrl of this.urlList) {

      const page = await this.getPage(baseUrl);

      for (let index = 0; index < 10; index++) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 1s
      }


      const result: IProduct[] = await page.evaluate(() => {
  
        let prod: IProduct[] = [];      
  
        document
          .querySelectorAll('.product-card')
          .forEach((elCard) => 
          {
            const name = elCard.querySelector('.product-name')?.innerHTML.toString().replace('\t', '').replace('\n', '').trim();;          
            const url = elCard.querySelector('.product-name')?.getAttribute('href');
            const price = elCard.querySelector('.price span span')?.innerHTML.toString().trim();
            const priceOld = elCard.querySelector('.price-discount')?.textContent?.toString().trim();
            const imgUrl = [];
            
            prod.push({ name, url, price, priceOld, imgUrl });          
          });
  
        return prod;
      });
      
      this._products.push(...result);
      page.close();
    }
    
  }

  /* refill products from cards */
  public async refillProducts() {

    // let page = await this.browser.newPage();

    for (const product of this._products) {

      product.url = DOMAIN + product.url;
      const page = await this.getPage(product.url);
  
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
            arImg.push(imgUrl ? imgUrl : '');
          })
  
        return arImg;
      });
  
      product.imgUrl?.push(...imgUrlList);
  
  
      // breadCrumb
      const brCmb = await page.evaluate(() => {
        const bcListItems: any[] = [];
        document.querySelector('.breadcrumb')?.querySelectorAll('a.breadcrumb-item').forEach((el) => {
          bcListItems.push({
            url: el.getAttribute('href'),
            text: el.getAttribute('title'),
          });
        })
        return bcListItems;
      });
      product.breadCrumb = brCmb.map(({ url, text}) => {
        return {
          url: `${DOMAIN}${url}`,
          text,
        }
      });
  
      // region
      product.region = await page.evaluate(() => {
        return document
                .querySelector('.top-location .select-city-link a')?.textContent?.toString()
                .replace('\t', '').replace('\n', '').trim();
      });
  
      page.close();
    }

  }

  public async makeCsv() {
    for (const row of this._products) {
      await this.csvWriter.writeRecords([{
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

  private async getPage(url: string): Promise<Page> {

    const page: Page = await this.browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // transform region
    if (this.region) {
      await page.evaluate(() => {
        const element: HTMLElement | null = document.querySelector('.top-location .select-city-link a');
        element?.click();
      });

      await page.type('input[name=city]', this.region);
  
      for (let index = 0; index < 10; index++) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 1s
      }

      await page.click('#region #savecity');    
    }

    return page;
  }

  public storeXl() {
    
    for (let index = 0; index < this.products.length; index++) {
      const element = this.products[index];
      const row = index + 1;

      this.worksheet.cell(row, 1).string(element.name ?? '');
      this.worksheet.cell(row, 2).string(element.region ?? '');
      this.worksheet.cell(row, 3).string(element.price ?? '');
      this.worksheet.cell(row, 4).string(element.priceOld ?? '');
      this.worksheet.cell(row, 5).string(element.stock ?? '');
      this.worksheet.cell(row, 6).string(element.url ?? '');

      let col = 7;

      if (element.breadCrumb?.length) {
        for (const bc of element.breadCrumb) {          
          this.worksheet.cell(row, col).string(bc.text ?? '');
          col++;
          this.worksheet.cell(row, col).string(bc.url ?? '');
          col++;
        }
      }

      if (element.imgUrl?.length) {
        for (const imgUrl of element.imgUrl) {
          this.worksheet.cell(row, col).string(imgUrl ?? '');
          col++;
        }
      }
    }

  } 

  get products() {
    return this._products;
  }
}