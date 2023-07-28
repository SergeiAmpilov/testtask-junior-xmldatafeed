import puppeteer, { Browser } from "puppeteer";



async function test() {
  
  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const baseUrl = 'https://www.toy.ru/catalog/modeli_mashin/welly_99198_velli_voennyy_avtomobil_s_pulemyetom/';

  let page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  await page.evaluate(() => {
    const element: HTMLElement | null = document.querySelector('.top-location .select-city-link a');
    element?.click();
  });



  await page.type('input[name=city]', 'г Ростов-на-Дону');
  
  for (let index = 0; index < 10; index++) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 1s
  }
  
  await page.click('#region #savecity');


  

}


test();