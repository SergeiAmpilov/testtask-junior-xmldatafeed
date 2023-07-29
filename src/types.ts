export type ParsedString = string | null | undefined;

export type BreadCrumb = {
  url?: ParsedString;
  text?: ParsedString;
}

export type Product = {
  name?: ParsedString;
  url?: ParsedString;
  price?: ParsedString;
  priceOld: ParsedString;
  region?: ParsedString;
  breadCrumbs?: BreadCrumb[];
  stock?: ParsedString;
  imgUrl?: ParsedString[];
}

export type ProductPack = Product[];