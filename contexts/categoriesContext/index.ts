// @ts-ignore
import { createContext } from "react";

export interface CategoryItem {
  id: string;
  name: string;
  label: string;
}

export interface CategoriesContext {
  categories: CategoryItem[];
}

export const CategoriesContext = createContext<CategoriesContext>({
  categories: [],
});
