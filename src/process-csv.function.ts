import { createObjectCsvWriter } from 'csv-writer';
import { resolve } from 'path';
import { IProduct } from './item.interface';



export const processCsv = async (data: IProduct[]) => {

  const csvWriter = createObjectCsvWriter({
    path: `data-${Math.floor(Date.now()/1000)}.csv`,
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


  for (const row of data) {
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


  console.log('writing done');


}