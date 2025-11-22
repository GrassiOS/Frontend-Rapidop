import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useBusinesses, useCategories, useCurrentUser } from '../hooks/useGraphQL';
import { Business, Category } from '../types/graphql';

const ExampleGraphQLUsage: React.FC = () => {
  const { user, loading: userLoading, error: userError } = useCurrentUser();
  const { data: businessesData, loading: businessesLoading, error: businessesError, refetch: refetchBusinesses } = useBusinesses({
    page: 1,
    limit: 10
  });
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const renderBusiness = ({ item }: { item: Business }) => (
    <View style={styles.businessCard}>
      <Text style={styles.businessName}>{item.name}</Text>
      <Text style={styles.businessDescription}>{item.description}</Text>
      {item.location && (
        <Text style={styles.businessLocation}>
          {item.location.address}, {item.location.city}
        </Text>
      )}
      {item.rating && (
        <Text style={styles.businessRating}>Rating: {item.rating}/5</Text>
      )}
      <View style={styles.categoriesContainer}>
        {item.categories.map((category) => (
          <Text key={category.id} style={styles.categoryTag}>
            {category.name}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Text style={styles.categoryName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.categoryDescription}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  if (userLoading || businessesLoading || categoriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (userError || businessesError || categoriesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error: {userError || businessesError || categoriesError}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetchBusinesses}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>Current User</Text>
          <Text>Name: {user.name}</Text>
          <Text>Email: {user.email}</Text>
        </View>
      )}

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.businessesSection}>
        <Text style={styles.sectionTitle}>
          Businesses ({businessesData?.totalCount || 0})
        </Text>
        <FlatList
          data={businessesData?.items || []}
          renderItem={renderBusiness}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  businessesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  businessCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  businessLocation: {
    fontSize: 12,
    color: '#495057',
    marginBottom: 4,
  },
  businessRating: {
    fontSize: 12,
    color: '#28a745',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  categoryItem: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  categoryDescription: {
    color: 'white',
    fontSize: 10,
  },
});

export default ExampleGraphQLUsage;