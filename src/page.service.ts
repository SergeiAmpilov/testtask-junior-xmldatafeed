import { Browser, Page } from "puppeteer";

export async function getPage(browser: Browser, url: string, region?: string): Promise<Page> {

  const page: Page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // set region if necessary
  if (region) {
    
    await page.evaluate(() => {
      const element: HTMLElement | null = document.querySelector('.top-location .select-city-link a');
      element?.click();
    });

    await page.type('input[name=city]', region);

    // Wait 1s
    await new Promise((resolve) => setTimeout(resolve, 1000)); 

    await page.click('#region #savecity');
  }

  return page;

}