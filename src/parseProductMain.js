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

  const productDataUA = await page.evaluate(() => {
    const titleElement = document.querySelector('.product-info__title');
    const descriptionElement = document.querySelector('.nd-text');
    const metaTitleElement = document.querySelector('title');
    const metaDescriptionElement = document.querySelector('meta[name="description"]');
    const metaKeywordsElement = document.querySelector('meta[name="keywords"]');
    const articleElement = document.querySelector('.pif-vendor-num');
    const priceElement = document.querySelector('.price-new__uah');
    const brandElements = document.querySelectorAll('.attribute-text');
    const imageElement = document.querySelector('.slick-track a img');

    const titleUa = titleElement.innerText.replace(/ябко/gi, 'Black Store');
    const description = descriptionElement.innerText.replace(/ябко/gi, 'Black Store');
    const metaTitle = metaTitleElement ? metaTitleElement.innerText.replace(/ябко/gi, 'Black Store') : null;
    const metaDescription = metaDescriptionElement ? metaDescriptionElement.getAttribute('content').replace(/ябко/gi, 'Black Store') : null;
    const metaKeywords = metaKeywordsElement ? metaKeywordsElement.getAttribute('content').replace(/ябко/gi, 'Black Store') : null;
    const article = articleElement.innerText;
    const price = priceElement.innerText.replace(/\D/g, '');
    const brand = brandElements[0].innerText.replace(/ябко/gi, 'Black Store');
    const imageUrl = imageElement.src;

    return {
      titleUa,
      metaTitle,
      metaDescription,
      metaKeywords,
      description,
      article,
      price,
      brand,
      imageUrl,
    };
  });
  await browser.close();

  return {
    ...productDataUA,
  };
}

async function main() {
  try {
    console.log('Начало парсинга...');
    const categoryUrl = 'https://jabko.ua/iphone/apple-iphone-15-plus/';
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
