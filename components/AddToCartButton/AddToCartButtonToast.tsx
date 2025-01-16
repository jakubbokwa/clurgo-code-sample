// @ts-nocheck
import React, { CSSProperties, useEffect, useState } from "react";
import { useFloating } from "@floating-ui/react";

// internal element whixh shows the toast message when the user adds a product to the cart. Not inserted directly in Plasmic.

type AddToCartButtonToastProps = {
  x: number;
  y: number;
  content: string;
  duration?: number;
  toastStyles?: CSSProperties;
};

const AddToCartButtonToast = ({
  x,
  y,
  content,
  duration,
  toastStyles,
}: AddToCartButtonToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        position: "fixed",
        zIndex: 9999,
        width: "max-content",
        left: "auto",
        fontFamily: "var(--shop-calibre)",
        top: y,
        right: x,
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        ...toastStyles,
      }}
    >
      {content}
    </div>
  );
};

export default AddToCartButtonToast;
