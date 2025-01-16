// @ts-nocheck
import React, {
  Children,
  cloneElement,
  CSSProperties,
  ReactElement,
  useState,
} from "react";
import { CodeComponentMeta } from "@plasmicapp/host";
import { AvailabilityContainer } from "@commercelayer/react-components";

import { useProductContext } from "../../hooks/useProductContext";
import { useAddToCartButtonContext } from "../../hooks/useAddToCartButtonContext";

import { buildRegisterComponentFn } from "../../lib";

interface AddToCartButtonQuantityProps {
  className?: string;
  inputClassName?: string;
  inputStyles?: CSSProperties;
  decreaseButtonSlot: ReactElement;
  increaseButtonSlot: ReactElement;
}

const defaultInputStyles: CSSProperties = {
  appearance: "textfield",
  textAlign: "center",
  fontSize: "inherit",
  color: "inherit",
  padding: "16px 0",
  MozAppearance: "textfield",
  WebkitAppearance: "none",
  width: "50px",
  border: "1px solid #CFD2D3",
  borderTop: "none",
  borderBottom: "none",
};

const AddToCartButtonQuantity: React.FC<AddToCartButtonQuantityProps> = ({
  className,
  decreaseButtonSlot,
  increaseButtonSlot,
  inputStyles,
  inputClassName,
}) => {
  const [stock, setStock] = useState<number | null>(null);
  const product = useProductContext();
  const { quantity = 1, setQuantity } = useAddToCartButtonContext() || {};

  const handleDecrease = () => {
    if (setQuantity) {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleIncrease = () => {
    if (setQuantity && (!stock || quantity < stock)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (setQuantity) {
      const newQuantity = Number(event.target.value);
      const clampedQuantity = Math.max(1, Math.min(newQuantity, stock || 1));
      setQuantity(clampedQuantity);
    }
  };

  const renderButtonSlot = (slot: ReactElement, handler: () => void) =>
    Children.map(slot, (child) =>
      cloneElement(child, {
        onClick: handler,
      })
    );

  return (
    <AvailabilityContainer
      skuCode={product.sku}
      getQuantity={(commercelayerStockValue) =>
        setStock(commercelayerStockValue)
      }
    >
      <div className={className}>
        {renderButtonSlot(decreaseButtonSlot, handleDecrease)}
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          className={inputClassName}
          style={inputStyles || defaultInputStyles}
          min={1}
          max={stock || 1}
        />
        {renderButtonSlot(increaseButtonSlot, handleIncrease)}
      </div>
    </AvailabilityContainer>
  );
};

const AddToCartButtonQuantityMeta: CodeComponentMeta<AddToCartButtonQuantityProps> =
  {
    name: "add-to-cart-button-quantity-new",
    displayName: "Add To Cart Button - Quantity",
    importPath: "@xyz/plasmic-components",
    importName: "AddToCartButtonQuantity",
    props: {
      decreaseButtonSlot: {
        type: "slot",
        displayName: "Slot - Decrease Button",
      },
      increaseButtonSlot: {
        type: "slot",
        displayName: "Slot - Increase Button",
      },
      inputStyles: {
        type: "object",
        displayName: "Input style object",
        defaultValue: defaultInputStyles,
      },
      inputClassName: {
        type: "string",
        displayName: "Input class name",
        defaultValue: "add-to-cart-quantity-input",
      },
    },
  };

export const registerAddToCartButtonQuantity = buildRegisterComponentFn(
  AddToCartButtonQuantity,
  AddToCartButtonQuantityMeta
);

export default AddToCartButtonQuantity;
