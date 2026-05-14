import { useState, useEffect, useCallback } from "react";

interface CurrentProduct {
  id: string;
  name: string;
}

let currentProduct: CurrentProduct | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((fn) => fn());

export const setCurrentProduct = (product: CurrentProduct | null) => {
  currentProduct = product;
  notify();
};

export const getCurrentProduct = (): CurrentProduct | null => currentProduct;

export const useCurrentProduct = () => {
  const [product, setProduct] = useState<CurrentProduct | null>(currentProduct);

  useEffect(() => {
    const listener = () => setProduct(currentProduct);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const set = useCallback((p: CurrentProduct | null) => {
    setCurrentProduct(p);
  }, []);

  const clear = useCallback(() => {
    setCurrentProduct(null);
  }, []);

  return { product, set, clear };
};
