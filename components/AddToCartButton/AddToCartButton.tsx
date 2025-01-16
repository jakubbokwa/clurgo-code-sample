// @ts-nocheck

import React, {
  cloneElement,
  CSSProperties,
  ReactElement,
  useState,
} from "react";
import { CodeComponentMeta } from "@plasmicapp/host";
import {
  AddToCartButton as CLAddToCartButton,
  Price,
} from "@commercelayer/react-components";

import { useFlags } from "flagsmith/react";

import { useAddToCartButtonContext } from "../../hooks/useAddToCartButtonContext";
import { useProductContext } from "../../hooks/useProductContext";
import { useStackContext } from "../../hooks/useStackContext";
import { useGoogleAnalyticsContext } from "../../hooks/useGoogleAnalyticsContext";

import { CustomAddToCartButtonProps } from "../../types/Order";
import { Product } from "../../types/Product";

import Toast from "./AddToCartButtonToast";

import { buildRegisterComponentFn } from "../../lib";

type AddToCartButtonProps = {
  className?: string;
  children: ReactElement;
  toastX: number;
  toastY: number;
  toastDuration: number;
  toastStyles: {
    success: CSSProperties;
    error: CSSProperties;
  };
  toastContent: {
    success: string;
    error: string;
  };
};

const AddToCartButton = ({
  className,
  children,
  toastX,
  toastY,
  toastDuration,
  toastStyles,
  toastContent,
}: AddToCartButtonProps) => {
  const [price, setPrice] = useState<number>();
  const [toast, setToast] = useState<ReactElement | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const product = useProductContext();
  const context = useAddToCartButtonContext();
  const quantity = context?.quantity || 1;

  const ds = useStackContext();
  const flags = useFlags(["google-analytics-tracking"]);
  const ga4 = useGoogleAnalyticsContext();

  const track = (product: Product) => {
    if (!flags["google-analytics-tracking"].enabled) return;

    const breadcrumb = ds.data.currentPage?.breadcrumb?.itemListElement;
    if (!breadcrumb || breadcrumb.length < 3) return;

    const category = breadcrumb[1].name;

    ga4?.add_to_cart({
      currency: "EUR",
      value: price,
      items: [
        {
          item_id: product.sku,
          item_name: product.name,
          item_category: category,
          price: price,
          item_brand: product.brands?.name,
        },
      ],
    });
  };

  const handleToastAndDisable = (success: boolean) => {
    const content = success ? toastContent.success : toastContent.error;
    const styles = success ? toastStyles.success : toastStyles.error;

    setToast(
      <Toast
        x={toastX}
        y={toastY}
        duration={toastDuration}
        content={content}
        toastStyles={styles}
      />
    );

    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), toastDuration);

    if (success) {
      track(product);
    }

    setTimeout(() => setToast(null), toastDuration);
  };

  const renderChildren = (props: CustomAddToCartButtonProps) => {
    return cloneElement(children, {
      onClick: function () {
        void props.handleClick().then(({ success }) => {
          handleToastAndDisable(success);
        });
      },
      isDisabled: isDisabled,
    });
  };

  return (
    <>
      <Price skuCode={product.sku}>
        {(prices) => {
          if (prices.prices.length > 0) {
            if (prices.prices[0].amount_float) {
              setPrice(prices.prices[0].amount_float);
            }
          }

          return (
            <CLAddToCartButton
              className={className}
              skuCode={product.sku}
              quantity={quantity.toString()}
            >
              {(childrenProps) =>
                renderChildren(childrenProps as CustomAddToCartButtonProps)
              }
            </CLAddToCartButton>
          );
        }}
      </Price>
      {toast}
    </>
  );
};

const AddToCartButtonMeta: CodeComponentMeta<AddToCartButtonProps> = {
  name: "add-to-cart-button-new",
  displayName: "Add To Cart Button",
  importPath: "@xyz/plasmic-components",
  importName: "AddToCartButton",
  props: {
    children: {
      type: "slot",
    },
    toastStyles: {
      type: "object",
      displayName: "Toast message style",
      defaultValue: {
        success: {
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
        },
        error: {
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
        },
      },
    },
    toastX: {
      type: "number",
      displayName: "Toast message X position (from the right) [px]",
      defaultValue: 50,
    },
    toastY: {
      type: "number",
      displayName: "Toast message Y position (from the top) [px]",
      defaultValue: 50,
    },
    toastDuration: {
      type: "number",
      displayName: "Toast message duration [ms]",
      defaultValue: 3000,
    },
    toastContent: {
      type: "object",
      displayName: "Toast message content (success and error)",
      defaultValue: {
        success: "Erfolgreich hinzugefügt!",
        error: "Fehler beim Hinzufügen / Ungenügende Lagermenge!",
      },
    },
  },
};

export const registerAddToCartButton = buildRegisterComponentFn(
  AddToCartButton,
  AddToCartButtonMeta
);

export default AddToCartButton;
