//@ts-ignore
import { createContext } from "react";
import { AddToCartButtonQuantity } from "../../types/Order";

export const AddToCartButtonContext =
  createContext<AddToCartButtonQuantity | null>(null);
