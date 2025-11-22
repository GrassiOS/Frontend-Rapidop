import { graphqlRequest } from '../constants/api';
import {
  User,
  Business,
  Category,
  Product,
  Reservation,
  Rating,
  History,
  AuthResponse,
  PaginatedResponse,
  CreateUserInput,
  UpdateUserInput,
  CreateBusinessInput,
  UpdateBusinessInput,
  CreateProductInput,
  CreateReservationInput,
  UpdateReservationInput,
  CreateRatingInput,
  BusinessFiltersInput,
  ProductFiltersInput,
  PaginationInput
} from '../types/graphql';

// Auth Services
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user {
            id
            name
            email
            phone
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `;
    const result = await graphqlRequest<{ login: AuthResponse }>(query, { email, password });
    return result.login;
  },

  async register(input: CreateUserInput): Promise<AuthResponse> {
    const query = `
      mutation Register($input: CreateUserInput!) {
        register(input: $input) {
          token
          user {
            id
            name
            email
            phone
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `;
    const result = await graphqlRequest<{ register: AuthResponse }>(query, { input });
    return result.register;
  },

  async getCurrentUser(): Promise<User> {
    const query = `
      query GetCurrentUser {
          id
          name
          email
          phone
          isActive
          createdAt
          updatedAt
      }
    `;
    const result = await graphqlRequest<{ me: User }>(query);
    return result.me;
  }
};

// User Services
export const userService = {
  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const query = `
      mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          name
          email
          phone
          isActive
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest<{ updateUser: User }>(query, { id, input });
    return result.updateUser;
  }
};

// Business Services
export const businessService = {
  async getBusinesses(filters?: BusinessFiltersInput): Promise<PaginatedResponse<Business>> {
    const query = `
      query GetBusinesses($filters: BusinessFiltersInput) {
        businesses(filters: $filters) {
          items {
            id
            name
            description
            phone
            email
            website
            isActive
            rating
            categories {
              id
              name
              description
            }
            location {
              id
              address
              city
              state
              zipCode
              latitude
              longitude
            }
            createdAt
            updatedAt
          }
          totalCount
          hasNextPage
          hasPreviousPage
        }
      }
    `;
    const result = await graphqlRequest<{ businesses: PaginatedResponse<Business> }>(query, { filters });
    return result.businesses;
  },

  async getBusiness(id: string): Promise<Business> {
    const query = `
      query GetBusiness($id: ID!) {
        business(id: $id) {
          id
          name
          description
          phone
          email
          website
          isActive
          rating
          categories {
            id
            name
            description
          }
          location {
            id
            address
            city
            state
            zipCode
            latitude
            longitude
          }
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest<{ business: Business }>(query, { id });
    return result.business;
  },

  async createBusiness(input: CreateBusinessInput): Promise<Business> {
    const query = `
      mutation CreateBusiness($input: CreateBusinessInput!) {
        createBusiness(input: $input) {
          id
          name
          description
          phone
          email
          website
          isActive
          rating
          categories {
            id
            name
            description
          }
          location {
            id
            address
            city
            state
            zipCode
            latitude
            longitude
          }
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest<{ createBusiness: Business }>(query, { input });
    return result.createBusiness;
  }
};

// Category Services
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const query = `
      query GetCategories {
        categories {
          id
          name
          description
          isActive
        }
      }
    `;
    const result = await graphqlRequest<{ categories: Category[] }>(query);
    return result.categories;
  }
};

// Product Services
export const productService = {
  async getProducts(filters?: ProductFiltersInput): Promise<PaginatedResponse<Product>> {
    const query = `
      query GetProducts($filters: ProductFiltersInput) {
        products(filters: $filters) {
          items {
            id
            name
            description
            price
            isActive
            businessId
            business {
              id
              name
            }
            categories {
              id
              name
              description
            }
            createdAt
            updatedAt
          }
          totalCount
          hasNextPage
          hasPreviousPage
        }
      }
    `;
    const result = await graphqlRequest<{ products: PaginatedResponse<Product> }>(query, { filters });
    return result.products;
  },

  async getProduct(id: string): Promise<Product> {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          name
          description
          price
          isActive
          businessId
          business {
            id
            name
            description
            phone
            email
            location {
              address
              city
              state
            }
          }
          categories {
            id
            name
            description
          }
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest<{ product: Product }>(query, { id });
    return result.product;
  }
};

// Reservation Services
export const reservationService = {
  async getReservations(filters?: PaginationInput): Promise<PaginatedResponse<Reservation>> {
    const query = `
      query GetReservations($filters: PaginationInput) {
        reservations(filters: $filters) {
          items {
            id
            userId
            businessId
            productId
            reservationDate
            numberOfPeople
            status
            notes
            business {
              id
              name
              location {
                address
                city
              }
            }
            product {
              id
              name
              price
            }
            createdAt
            updatedAt
          }
          totalCount
          hasNextPage
          hasPreviousPage
        }
      }
    `;
    const result = await graphqlRequest<{ reservations: PaginatedResponse<Reservation> }>(query, { filters });
    return result.reservations;
  },

  async createReservation(input: CreateReservationInput): Promise<Reservation> {
    const query = `
      mutation CreateReservation($input: CreateReservationInput!) {
        createReservation(input: $input) {
          id
          userId
          businessId
          productId
          reservationDate
          numberOfPeople
          status
          notes
          business {
            id
            name
          }
          product {
            id
            name
            price
          }
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest<{ createReservation: Reservation }>(query, { input });
    return result.createReservation;
  }
};

// Rating Services
export const ratingService = {
  async createRating(input: CreateRatingInput): Promise<Rating> {
    const query = `
      mutation CreateRating($input: CreateRatingInput!) {
        createRating(input: $input) {
          id
          userId
          businessId
          rating
          comment
          business {
            id
            name
          }
          createdAt
          updatedAt
        }
      }
    `;
    const result = await graphqlRequest<{ createRating: Rating }>(query, { input });
    return result.createRating;
  }
};