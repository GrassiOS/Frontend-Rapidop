import { gql } from '@apollo/client';

// Auth Queries
export const LOGIN = gql`
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

export const REGISTER_USER = gql`
  mutation RegisterUser($email: String!, $password: String!, $name: String!, $phone: String!) {
    register(email: $email, password: $password, name: $name, phone: $phone) {
      token
      user {
        id
        email
        name
        phone
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
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

// User Queries
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
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

export const UPDATE_USER = gql`
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

// Business Queries
// Query principal: Obtener negocios del usuario autenticado
export const GET_BUSINESSES_BY_USER = gql`
  query GetBusinessesByUser($userId: Int!) {
    getBusinessesByUser(userId: $userId) {
      id
      name
      description
      address
      foodType
      latitude
      longitude
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Query alternativa: Obtener todos los negocios
export const GET_ALL_BUSINESSES = gql`
  query GetAllBusinesses {
    getAllBusinesses {
      id
      name
      description
      address
      foodType
      latitude
      longitude
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Query para búsqueda
export const SEARCH_BUSINESSES = gql`
  query SearchBusinesses($query: String!) {
    searchBusinesses(query: $query) {
      id
      name
      description
      address
      foodType
      latitude
      longitude
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Backward compatibility
export const GET_BUSINESSES = GET_BUSINESSES_BY_USER;
export const GET_BUSINESSES_WITH_TOKEN = GET_BUSINESSES_BY_USER;

export const GET_BUSINESS_BY_ID = gql`
  query GetBusiness($businessId: Int!) {
    getBusiness(businessId: $businessId) {
      id
      name
      description
      address
      foodType
      latitude
      longitude
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness(
    $name: String!
    $description: String!
    $address: String!
    $foodType: String!
    $latitude: Float!
    $longitude: Float!
    $token: String!
  ) {
    createBusiness(
      name: $name
      description: $description
      address: $address
      foodType: $foodType
      latitude: $latitude
      longitude: $longitude
      token: $token
    ) {
      id
      name
      description
      address
      foodType
      latitude
      longitude
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness(
    $token: String!
    $businessId: Int!
    $name: String
    $description: String
    $address: String
    $foodType: String
    $latitude: Float
    $longitude: Float
  ) {
    updateBusiness(
      token: $token
      businessId: $businessId
      name: $name
      description: $description
      address: $address
      foodType: $foodType
      latitude: $latitude
      longitude: $longitude
    ) {
      id
      name
      description
      address
      foodType
      latitude
      longitude
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BUSINESS = gql`
  mutation DeleteBusiness($token: String!, $businessId: Int!) {
    deleteBusiness(token: $token, businessId: $businessId)
  }
`;

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    getAllCategories {
      id
      name
    }
  }
`;

// Product Queries
export const GET_PRODUCTS = gql`
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

export const GET_PRODUCT = gql`
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



// Reservation Queries
export const GET_RESERVATIONS = gql`
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

export const GET_RESERVATION = gql`
  query GetReservation($id: ID!) {
    reservation(id: $id) {
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
        phone
        email
        location {
          address
          city
          state
        }
      }
      product {
        id
        name
        description
        price
      }
      createdAt
      updatedAt
    }
  }
`;

// History Queries
export const GET_USER_HISTORY = gql`
  query GetUserHistory($filters: PaginationInput) {
    userHistory(filters: $filters) {
      items {
        id
        userId
        action
        details
        createdAt
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

// New User and Login Mutations
export const CREATE_USER = gql`
  mutation CreateUser(
    $email: String!
    $name: String!
    $password: String!
    $phone: String!
    $role: String!
  ) {
    createUser(
      email: $email
      name: $name
      password: $password
      phone: $phone
      role: $role
    ) {
      id
      email
      name
      phone
      role
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      accessToken
      user {
        id
        email
        name
        phone
        role
      }
    }
  }
`;
// Product Mutations and Queries
export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $businessId: Int!
    $name: String!
    $description: String!
    $price: Float!
    $discountedPrice: Float!
    $stock: Int!
    $categoryId: Int!
    $imageFile: Upload
    $status: String!
    $expiresAt: String
    $token: String!
  ) {
    createProduct(
      businessId: $businessId
      name: $name
      description: $description
      price: $price
      discountedPrice: $discountedPrice
      stock: $stock
      categoryId: $categoryId
      imageFile: $imageFile
      status: $status
      expiresAt: $expiresAt
      token: $token
    ) {
      id
      businessId
      categoryId
      name
      description
      price
      discountedPrice
      stock
      imageUrl
      status
      expiresAt
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCTS_BY_BUSINESS = gql`
  query GetProductsByBusiness($businessId: Int!) {
    getProductsByBusiness(businessId: $businessId) {
      id
      businessId
      categoryId
      name
      description
      price
      discountedPrice
      stock
      imageUrl
      status
      expiresAt
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts($limit: Int, $offset: Int) {
    getAllProducts(limit: $limit, offset: $offset) {
      id
      businessId
      categoryId
      name
      description
      price
      discountedPrice
      stock
      imageUrl
      status
      expiresAt
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_PRODUCTS_WITH_BUSINESS = gql`
  query GetAllProductsWithBusiness($limit: Int, $offset: Int) {
    getAllProducts(limit: $limit, offset: $offset) {
      id
      businessId
      categoryId
      name
      description
      price
      discountedPrice
      stock
      imageUrl
      status
      expiresAt
      publishedAt
      createdAt
      updatedAt
    }
    getAllBusinesses {
      id
      name
      latitude
      longitude
      address
      description
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $productId: Int!
    $token: String!
    $name: String
    $description: String
    $price: Float
    $discountedPrice: Float
    $stock: Int
    $categoryId: Int
    $imageFile: Upload
    $imageUrl: String
    $status: String
    $expiresAt: String
  ) {
    updateProduct(
      productId: $productId
      token: $token
      name: $name
      description: $description
      price: $price
      discountedPrice: $discountedPrice
      stock: $stock
      categoryId: $categoryId
      imageFile: $imageFile
      imageUrl: $imageUrl
      status: $status
      expiresAt: $expiresAt
    ) {
      id
      businessId
      categoryId
      name
      description
      price
      discountedPrice
      stock
      imageUrl
      status
      expiresAt
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: Int!, $token: String!) {
    deleteProduct(productId: $productId, token: $token)
  }
`;

// Reservation Queries and Mutations
export const CREATE_RESERVATION = gql`
  mutation CreateReservation($businessId: Int!, $productId: Int!, $token: String!, $quantity: Int!) {
    createReservation(businessId: $businessId, productId: $productId, token: $token, quantity: $quantity) {
      id
      userId
      productId
      outletId
      quantity
      status
      createdAt
      updatedAt
      expiresAt
      pickedUpAt
      cancelledAt
    }
  }
`;

export const GET_MY_RESERVATIONS = gql`
  query GetMyReservations($token: String!, $status: String) {
    getMyReservations(token: $token, status: $status) {
      id
      userId
      productId
      outletId
      quantity
      status
      createdAt
      updatedAt
      expiresAt
      pickedUpAt
      cancelledAt
    }
  }
`;

export const GET_RESERVATION_BY_ID = gql`
  query GetReservationById($id: Int!, $token: String!) {
    getReservationById(id: $id, token: $token) {
      id
      userId
      productId
      outletId
      quantity
      status
      createdAt
      updatedAt
      expiresAt
      pickedUpAt
      cancelledAt
      product {
        id
        name
        description
        price
        discountedPrice
        imageUrl
        business {
          id
          name
          address
          phone
          latitude
          longitude
        }
      }
    }
  }
`;

export const CANCEL_RESERVATION = gql`
  mutation CancelReservation($reservationId: Int!, $token: String!) {
    cancelReservation(reservationId: $reservationId, token: $token) {
      id
      userId
      productId
      outletId
      quantity
      status
      createdAt
      updatedAt
      expiresAt
      cancelledAt
      pickedUpAt
    }
  }
`;

export const UPDATE_RESERVATION_STATUS = gql`
  mutation UpdateReservationStatus($reservationId: Int!, $token: String!, $status: String!) {
    updateReservationStatus(reservationId: $reservationId, token: $token, status: $status) {
      id
      userId
      productId
      outletId
      quantity
      status
      createdAt
      updatedAt
      expiresAt
      cancelledAt
      pickedUpAt
    }
  }
`;

export const CONFIRM_RESERVATION = gql`
  mutation ConfirmReservation($reservationId: Int!, $token: String!) {
    updateReservationStatus(reservationId: $reservationId, token: $token, status: "confirmed") {
      id
      userId
      productId
      outletId
      quantity
      status
      createdAt
      updatedAt
      expiresAt
      cancelledAt
      pickedUpAt
    }
  }
`;

export const MARK_AS_PICKED_UP = gql`
  mutation MarkAsPickedUp($reservationId: Int!, $token: String!) {
    markReservationPickedUp(reservationId: $reservationId, token: $token) {
      id
      userId
      productId
      outletId
      quantity
      status
      createdAt
      updatedAt
      expiresAt
      pickedUpAt
      cancelledAt
    }
  }
`;

export const GET_BUSINESS_RESERVATIONS = gql`
  query GetBusinessReservations($businessId: Int!, $token: String!, $status: String) {
    getBusinessReservations(businessId: $businessId, token: $token, status: $status) {
      id
      userId
      productId
      outletId
      quantity
      status
      createdAt
      updatedAt
      expiresAt
      pickedUpAt
      cancelledAt
    }
  }
`;

// Rating Queries and Mutations
export const RATE_BUSINESS = gql`
  mutation RateBusiness($token: String!, $businessId: Int!, $score: Int!, $comment: String) {
    rateBusiness(token: $token, businessId: $businessId, score: $score, comment: $comment) {
      id
      raterUserId
      targetType
      targetUserId
      score
      comment
      createdAt
    }
  }
`;

export const RATE_CONSUMER = gql`
  mutation RateConsumer($token: String!, $consumerUserId: Int!, $score: Int!, $comment: String) {
    rateConsumer(token: $token, consumerUserId: $consumerUserId, score: $score, comment: $comment) {
      id
      raterUserId
      targetType
      targetUserId
      score
      comment
      createdAt
    }
  }
`;

export const DELETE_RATING = gql`
  mutation DeleteRating($token: String!, $ratingId: Int!) {
    deleteRating(token: $token, ratingId: $ratingId)
  }
`;


export const GET_BUSINESS_RATINGS = gql`
  query GetBusinessRatings($businessId: Int!) {
    getBusinessRatings(businessId: $businessId) {
      averageRating
      totalRatings
      ratings {
        id
        raterUserId
        targetType
        targetUserId
        score
        comment
        createdAt
      }
    }
  }
`;

export const GET_CONSUMER_RATINGS = gql`
  query GetConsumerRatings($consumerUserId: Int!) {
    getConsumerRatings(consumerUserId: $consumerUserId) {
      averageRating
      totalRatings
      ratings {
        id
        raterUserId
        targetType
        targetUserId
        score
        comment
        createdAt
      }
    }
  }
`;

export const GET_MY_GIVEN_RATINGS = gql`
  query GetMyGivenRatings($token: String!) {
    getMyGivenRatings(token: $token) {
      id
      raterUserId
      targetType
      targetUserId
      score
      comment
      createdAt
    }
  }
`;

export const GET_MY_RECEIVED_RATINGS = gql`
  query GetMyReceivedRatings($token: String!) {
    getMyReceivedRatings(token: $token) {
      averageRating
      totalRatings
      ratings {
        id
        raterUserId
        targetType
        targetUserId
        score
        comment
        createdAt
      }
    }
  }
`;
