// @ts-ignore
import { RichTextContent } from "@graphcms/rich-text-types";

export interface RichTextBlock {
  html: string;
  raw: RichTextContent;
}

export interface Dimension {
  depth: number;
  diameter: number;
  height: number;
  length: number;
  weight: number;
  width: number;
}

export interface ProductImage {
  id: string;
  url: string;
  width: number;
  height: number;
  mimeType: string;
}

export interface Brand {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
}

export interface CategoryByCollection {
  id: string;
  name: string;
}

export interface PriceList {
  fileName: string;
  url: string;
}

export interface Specification {
  additives: string;
  assembledDepth: number;
  assembledHeight: number;
  assembledWidth: number;
  assemblyInstructions: RichTextBlock;
  chairBaseMaterial: string;
  color: string;
  configuratorId: string;
  coverMaterial: string;
  depth: number;
  diameter: number;
  enclosureColor: string;
  energyEfficiencyClass: string;
  grossWeight: number;
  hasLightbulbIncluded: boolean;
  hasOtherVersions: boolean;
  hasSwitch: boolean;
  height: number;
  importDate: Date;
  is100FabricsConcept: boolean;
  isConfigurable: boolean;
  isCustomized: boolean;
  isDimmable: boolean;
  isFabricLeatherChoosable: boolean;
  isMixNMatch: boolean;
  isNew: boolean;
  legColor: string;
  legHeight: number;
  legMaterial: string;
  manufacturer: string;
  manufacturerDeliveryTime: string;
  manufacturerProductName: string;
  material: string;
  miscColor: string;
  mpn: string;
  netWeight: number;
  packagingSize: string;
  packagingUnit: number;
  pattern: string;
  price: number;
  priceListName: string;
  productType: string;
  room: string;
  searchColor: string;
  seatingSurfaceMaterial: string;
  seoHeadline: string;
  seoText: string;
  shape: string;
  socket: string;
  style: string;
  sustainability: string;
  textileCoverMaterial: string;
  themes: string;
  titleTag: string;
  upholsteryCombination: string;
  upholsteryMaterial: string;
  wattage: string;
  width: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  buyable: boolean;
  brands: Brand;
  description: RichTextBlock;
  images: ProductImage[];
  previewImage: ProductImage;
  pricelist: PriceList;
  minQuantity: number;
  dimension: Dimension;
  specification: Specification;
  configuration?: ProductConfiguration;
}

export interface ProductConfiguration {
  id: string;
  price: number;
  image: string;
  pdf: string;
  title: string;
}

export interface ProductFromCategoryByCollection {
  id: string;
  name: string;
  categories: CategoryByCollection[];
  collections: {
    id: string;
    name: string;
  };
}

export interface ProductsFromCategoryByCollection {
  products: ProductFromCategoryByCollection[];
}
