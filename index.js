"use strict";

const puppeteer = require("puppeteer");
const fs = require("fs");

const SELECT_REGION_ELEMENT = ".FirstHeader_region__lHCGj";

const productSelectors = {
  rating: ".Summary_title__Uie8u",
  reviewCount: "#text",
  price: ".Price_priceDesktop__P9b2W ",
  priceOld: ".Price_role_old__qW2bx",
};

const [productLink, region] = process.argv.slice(2);
if (!productLink || !region) {
  console.log("required arguments are not entered");
} else {
  run();
}
async function run() {
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

  let value = null;
  const data = await Promise.all(
    Object.keys(productSelectors).map(async (key) => {
      value = await page
        .$eval(productSelectors[key], (el) => el.textContent)
        .catch(() => {});
      return { key, value };
    })
  );

  fs.writeFileSync(
    "product.txt",
    data
      .filter((val) => val)
      .map((val) => `${val.key} = ${parseFloat(val.value)}`)
      .join("\n")
  );

  await browser.close();
}

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
