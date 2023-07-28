export interface IProduct {
  name?: string;
  region?: string | null | undefined;
  breadCrumb?: any[];
  price?: string;
  priceOld?: string | undefined | null;
  stock?: any;
  imgUrl?: (string | null | undefined)[];
  url?: string | null;
}