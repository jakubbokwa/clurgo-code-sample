export interface AddToCartButtonQuantity {
  quantity: number;
  setQuantity: UpdateQuantityFn;
}

export type UpdateQuantityFn = (updateFn: (prev: number) => number) => void;

export interface AddToCartResult {
  success: boolean;
  orderId: string | undefined;
}

export interface CustomAddToCartButtonProps {
  handleClick: () => Promise<AddToCartResult>;
}
