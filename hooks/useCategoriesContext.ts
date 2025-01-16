//@ts-ignore
import { useContext } from "react";
import { CategoriesContext } from "../contexts/categoriesContext";

const useCategoriesContext = () => useContext(CategoriesContext);

export default useCategoriesContext;
