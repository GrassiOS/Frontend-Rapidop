import { useState } from 'react';
import productService, { Product, ProductInput } from '@/services/productService';

export const useProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (input: ProductInput): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const product = await productService.createProduct(input);
      return product;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProductsByBusiness = async (businessId: number): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      const products = await productService.getProductsByBusiness(businessId);
      return products;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: number,
    input: Partial<ProductInput>
  ): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const product = await productService.updateProduct(id, input);
      return product;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number, businessId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await productService.deleteProduct(id, businessId);
      return success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createProduct,
    getProductsByBusiness,
    updateProduct,
    deleteProduct,
  };
};
