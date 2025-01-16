// @ts-nocheck
import React, { ReactNode, useState, useContext, useEffect } from "react";
import { PlasmicCanvasContext } from "@plasmicapp/loader-nextjs";
import { AvailabilityContainer } from "@commercelayer/react-components";

import { AddToCartButtonContext } from "../../contexts/addToCartButtonContext";
import { useProductContext } from "../../../contexts";
import { buildRegisterComponentFn } from "../../../helpers/buildRegisterComponentFn";

export interface AddToCartButtonProviderProps {
  children?: ReactNode;
  childrenProductUnavailable?: ReactNode;
  childrenLoading?: ReactNode;
  simulateUnavailable?: boolean;
  simulateLoading?: boolean;
}

export default function AddToCartButtonProvider({
  children,
  childrenProductUnavailable,
  childrenLoading,
  simulateUnavailable,
  simulateLoading,
}: AddToCartButtonProviderProps) {
  const inEditor = useContext(PlasmicCanvasContext);
  const product = useProductContext();
  const [quantity, setQuantity] = useState<number>(1);
  const [commercelayerStock, setCommercelayerStock] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isProductBuyable = product.buyable ?? false;
  const isAvailable = isProductBuyable && (commercelayerStock ?? 0) > 0;
  const isSimulatedUnavailable = simulateUnavailable && inEditor;

  useEffect(() => {
    if (commercelayerStock !== null || !simulateLoading) {
      setIsLoading(false);
    }
  }, [commercelayerStock, simulateLoading]);

  return (
    <AvailabilityContainer
      skuCode={product.sku}
      getQuantity={(commercelayerStockValue) => {
        setCommercelayerStock(commercelayerStockValue);
        if (!simulateLoading) {
          setIsLoading(false);
        }
      }}
    >
      <AddToCartButtonContext.Provider
        value={{
          quantity,
          setQuantity,
        }}
      >
        {simulateLoading || isLoading
          ? childrenLoading
          : isAvailable && !isSimulatedUnavailable
          ? children
          : childrenProductUnavailable}
      </AddToCartButtonContext.Provider>
    </AvailabilityContainer>
  );
}

export const registerAddToCartButtonProvider = buildRegisterComponentFn(
  AddToCartButtonProvider,
  {
    name: "add-to-cart-button-provider",
    displayName: "Add To Cart Button - Provider",
    importPath: "@xyz/plasmic-components",
    importName: "AddToCartButtonProvider",
    providesData: true,
    props: {
      children: {
        type: "slot",
        defaultValue: [
          {
            type: "component",
            name: "add-to-cart-button-quantity-new",
          },
          {
            type: "component",
            name: "add-to-cart-button-new",
          },
        ],
      },
      childrenProductUnavailable: {
        type: "slot",
      },
      childrenLoading: {
        type: "slot",
      },
      simulateUnavailable: {
        type: "boolean",
        displayName: "Simulate unavailable product",
      },
      simulateLoading: {
        type: "boolean",
        displayName: "Simulate loading state",
      },
    },
  }
);
