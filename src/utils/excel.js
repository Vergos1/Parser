const ExcelJS = require('exceljs');

async function saveToExcel(data, filename) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('ProductsRu');

  worksheet.columns = [
    //note общие
    {header: 'title_ua', key: 'titleUa', width: 60},
    {header: 'title_ru', key: 'titleRu', width: 60},
    {header: 'meta_title', key: 'metaTitle', width: 30},
    {header: 'meta_title_ru', key: 'metaTitleRu', width: 30},
    {header: 'meta_desc', key: 'metaDescription', width: 100},
    {header: 'meta_desc_ru', key: 'metaDescriptionRu', width: 100},
    {header: 'meta_keywords', key: 'metaKeywords', width: 50},
    {header: 'meta_keywords_ru', key: 'metaKeywordsRu', width: 50},
    {header: 'desc_ua', key: 'description', width: 100},
    {header: 'desc_ru', key: 'descriptionRu', width: 100},

    //note данные
    {header: 'article', key: 'article', width: 30},
    {header: 'price', key: 'price', width: 20},
    {header: 'quantity', key: 'quantity', width: 20},
    {header: 'date_of_receipt', key: 'date_of_receipt', width: 20},

    //note связи
    {header: 'brand', key: 'brand', width: 20},

    //note характеристики

    //note изображение
    {header: 'image_url', key: 'imageUrl', width: 50},
    // { header: 'characteristic_desc', key: 'characteristic', width: 1000 },

  ];

  data.forEach(product => {
    product.date_of_receipt = "2023-10-11";
    product.quantity = 100;
    worksheet.addRow(product);
  });

  await workbook.xlsx.writeFile(filename);
}

// const testData = [
//   {
//     title: "Test Product",
//     description: "This is a test product description.",
//     imageUrl: "https://example.com/test-image.jpg"
//   }
// ];
//
// saveToExcel(testData, './output/test_products.xlsx');

module.exports = saveToExcel;
