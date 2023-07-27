export interface IProduct {
  name: string;
  region: string;
  breadCrumb: {
    [key: string]: string
  };
  price: number;
  priceOld?: number;
  stock: boolean;
  imgUrl: string[];
  url: string;
}