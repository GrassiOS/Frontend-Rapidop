import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authService,
  userService,
  businessService,
  categoryService,
  productService,
  reservationService,
  ratingService
} from '../services/graphqlService';

import {
  User,
  Business,
  Category,
  Product,
  Reservation,
  Rating,
  AuthResponse,
  PaginatedResponse,
  CreateUserInput,
  UpdateUserInput,
  CreateBusinessInput,
  CreateProductInput,
  CreateReservationInput,
  CreateRatingInput,
  BusinessFiltersInput,
  ProductFiltersInput,
  PaginationInput
} from '../types/graphql';

// Generic hook para manejar estados de loading, error y data
export const useAsync = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
};

// Auth Hooks
export const useLogin = () => {
  const { loading, error, execute } = useAsync<AuthResponse>();

  const login = useCallback(async (email: string, password: string) => {
    const result = await execute(() => authService.login(email, password));
    if (result?.token) {
      await AsyncStorage.setItem('auth_token', result.token);
    }
    return result;
  }, [execute]);

  return { login, loading, error };
};

export const useRegister = () => {
  const { loading, error, execute } = useAsync<AuthResponse>();

  const register = useCallback(async (input: CreateUserInput) => {
    const result = await execute(() => authService.register(input));
    if (result?.token) {
      await AsyncStorage.setItem('auth_token', result.token);
    }
    return result;
  }, [execute]);

  return { register, loading, error };
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching user';
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        fetchUser();
      }
    };
    checkAuthToken();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
};

// Business Hooks
export const useBusinesses = (filters?: BusinessFiltersInput) => {
  const [businesses, setBusinesses] = useState<PaginatedResponse<Business> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getBusinesses(filters);
      setBusinesses(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching businesses';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return { data: businesses, loading, error, refetch: fetchBusinesses };
};

export const useBusiness = (id: string) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getBusiness(id);
      setBusiness(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching business';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  return { data: business, loading, error, refetch: fetchBusiness };
};

export const useCreateBusiness = () => {
  const { loading, error, execute } = useAsync<Business>();

  const createBusiness = useCallback(async (input: CreateBusinessInput) => {
    return await execute(() => businessService.createBusiness(input));
  }, [execute]);

  return { createBusiness, loading, error };
};

// Categories Hook
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      setCategories(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching categories';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data: categories, loading, error, refetch: fetchCategories };
};

// Products Hooks
export const useProducts = (filters?: ProductFiltersInput) => {
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts(filters);
      setProducts(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { data: products, loading, error, refetch: fetchProducts };
};

// Reservations Hooks
export const useReservations = (filters?: PaginationInput) => {
  const [reservations, setReservations] = useState<PaginatedResponse<Reservation> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.getReservations(filters);
      setReservations(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching reservations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return { data: reservations, loading, error, refetch: fetchReservations };
};

export const useCreateReservation = () => {
  const { loading, error, execute } = useAsync<Reservation>();

  const createReservation = useCallback(async (input: CreateReservationInput) => {
    return await execute(() => reservationService.createReservation(input));
  }, [execute]);

  return { createReservation, loading, error };
};

// Rating Hook
export const useCreateRating = () => {
  const { loading, error, execute } = useAsync<Rating>();

  const createRating = useCallback(async (input: CreateRatingInput) => {
    return await execute(() => ratingService.createRating(input));
  }, [execute]);

  return { createRating, loading, error };
};

// Logout Hook
export const useLogout = () => {
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  return { logout };
};