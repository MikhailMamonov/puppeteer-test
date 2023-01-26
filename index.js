"use strict";

const puppeteer = require("puppeteer");
const fs = require("fs");

const SELECT_REGION_ELEMENT = ".FirstHeader_region__lHCGj";

const productSelectors = [
  ".Summary_title__Uie8u",
  ".Badge_badge__iw6ES",
  ".Price_priceDesktop__P9b2W ",
  ".Price_role_old__qW2bx",
];

const [productLink, region] = process.argv.slice(2);

(async () => {
  let launchOptions = { headless: false, args: ["--start-maximized"] };

  const browser = await puppeteer.launch({
    defaultViewport: null,
    ...launchOptions,
  });

  const page = await browser.newPage();
  await page.goto("https://www.vprok.ru/", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector(SELECT_REGION_ELEMENT);

  await page.click(SELECT_REGION_ELEMENT);

  const regionLink = await page.waitForXPath(
    `//div[contains(text(), '${region}')]`
  );
  await regionLink.click();
  await page.goto(productLink, { waitUntil: "networkidle0" });

  await delay(3000);
  await page.screenshot({ path: "screenshot.jpg", fullPage: true });

  const data = await Promise.all(
    productSelectors.map(async (selector) => {
      return await page.$eval(selector, (el) => el.textContent).catch(() => {});
    })
  );

  fs.writeFileSync("product.txt", data.filter((val) => val).join(", "));

  await browser.close();
})();

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
