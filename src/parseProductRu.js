const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const saveToExcel = require('./utils/excel');

puppeteer.use(StealthPlugin());

async function getProductLinks(url) {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  await page.goto(url);

  const productLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a.product_link'));
    return links.map(link => link.href);
  });

  await browser.close();
  return productLinks;
}

async function parseProduct(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  await page.goto(url, {waitUntil: 'domcontentloaded'});

  const productDataRU = await page.evaluate(() => {
    const titleRuElement = document.querySelector('.product-info__title');
    const descriptionRuElement = document.querySelector('.nd-text');
    const metaTitleRuElement = document.querySelector('title');
    const metaDescriptionRuElement = document.querySelector('meta[name="description"]');
    const metaKeywordsRuElement = document.querySelector('meta[name="keywords"]');

    const titleRu = titleRuElement && titleRuElement.innerText ? titleRuElement.innerText.replace(/ябко/gi, 'Black Store') : null;
    const descriptionRu = descriptionRuElement && descriptionRuElement.innerText ? descriptionRuElement.innerText.replace(/ябко/gi, 'Black Store') : null;
    const metaTitleRu = metaTitleRuElement && metaTitleRuElement.innerText ? metaTitleRuElement.innerText.replace(/ябко/gi, 'Black Store') : null;
    const metaDescriptionRu = metaDescriptionRuElement && metaDescriptionRuElement.getAttribute('content') ? metaDescriptionRuElement.getAttribute('content').replace(/ябко/gi, 'Black Store') : null;
    const metaKeywordsRu = metaKeywordsRuElement && metaKeywordsRuElement.getAttribute('content') ? metaKeywordsRuElement.getAttribute('content').replace(/ябко/gi, 'Black Store') : null;

    console.log('Данные на русском языке успешно получены.');
    return {
      titleRu,
      descriptionRu,
      metaTitleRu,
      metaDescriptionRu,
      metaKeywordsRu,
    };
  });
  await browser.close();

  return {
    ...productDataRU,
  };
}

async function main() {
  try {
    console.log('Начало парсинга...');
    const categoryUrl = 'https://jabko.ua/rus/iphone/apple-iphone-15-plus/';
    const productLinks = await getProductLinks(categoryUrl);

    console.log(`Найдено ${productLinks.length} ссылок на продукты.`);

    const productsData = [];
    for (const link of productLinks) {
      console.log(`Парсинг продукта по ссылке: ${link}`);
      try {
        const productData = await parseProduct(link);
        console.log(`Данные продукта: ${JSON.stringify(productData)}`);
        productsData.push(productData);
      } catch (error) {
        console.log(`Ошибка при парсинге продукта по ссылке: ${link}. Ошибка: ${error.message}`);
      }
    }

    console.log('Сохранение данных в Excel...');
    await saveToExcel(productsData, './output/products.xlsx');
    console.log("Данные успешно сохранены в 'products.xlsx'");
  } catch (error) {
    console.error('Произошла ошибка:', error.message);
  }
}

main();
