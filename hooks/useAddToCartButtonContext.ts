// @ts-ignore
import { useContext } from "react";
import { AddToCartButtonContext } from "../contexts/addToCartButtonContext";

export const useAddToCartButtonContext = () =>
  useContext(AddToCartButtonContext);
