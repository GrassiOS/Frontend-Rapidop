import { useState } from 'react';
import { businessService, BusinessInput, Business } from '@/services/businessService';

export const useBusiness = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBusiness = async (input: BusinessInput): Promise<Business | null> => {
    setLoading(true);
    setError(null);
    try {
      const business = await businessService.createBusiness(input);
      return business;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = async (id: number, input: BusinessInput): Promise<Business | null> => {
    setLoading(true);
    setError(null);
    try {
      const business = await businessService.updateBusiness(id, input);
      return business;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteBusiness = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await businessService.deleteBusiness(id);
      return success;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getBusinesses = async (): Promise<Business[]> => {
    setLoading(true);
    setError(null);
    try {
      const businesses = await businessService.getBusinesses();
      return businesses;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getBusinessById = async (id: number): Promise<Business | null> => {
    setLoading(true);
    setError(null);
    try {
      const business = await businessService.getBusinessById(id);
      return business;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinesses,
    getBusinessById,
  };
};