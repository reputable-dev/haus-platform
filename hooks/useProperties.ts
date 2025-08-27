import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { mockProperties, mockOffMarketProperties } from "@/mocks/properties";
import { Property, PropertyType, ListingType } from "@/types/property";

// Simulating API calls with mock data
const fetchProperties = async (): Promise<Property[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockProperties;
};

const fetchOffMarketProperties = async (): Promise<Property[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockOffMarketProperties;
};

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
  });
}

export function useOffMarketProperties() {
  return useQuery({
    queryKey: ["offMarketProperties"],
    queryFn: fetchOffMarketProperties,
  });
}

export function useAllProperties() {
  const { data: regularProperties, isLoading: isRegularLoading } = useProperties();
  const { data: offMarketProperties, isLoading: isOffMarketLoading } = useOffMarketProperties();

  const allProperties = useMemo(() => {
    if (!regularProperties && !offMarketProperties) return [];
    return [...(regularProperties || []), ...(offMarketProperties || [])];
  }, [regularProperties, offMarketProperties]);

  return {
    data: allProperties,
    isLoading: isRegularLoading || isOffMarketLoading,
  };
}

export function useFilteredProperties(
  properties: Property[] | undefined,
  filters: {
    search?: string;
    propertyTypes?: PropertyType[];
    listingTypes?: ListingType[];
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    suburbs?: string[];
    states?: string[];
  }
) {
  return useMemo(() => {
    if (!properties) return [];

    return properties.filter(property => {
      // Search filter
      if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !property.description.toLowerCase().includes(filters.search.toLowerCase()) &&
          !property.location.suburb.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Property type filter
      if (filters.propertyTypes && filters.propertyTypes.length > 0 && 
          !filters.propertyTypes.includes(property.type)) {
        return false;
      }

      // Listing type filter
      if (filters.listingTypes && filters.listingTypes.length > 0 && 
          !filters.listingTypes.includes(property.listingType)) {
        return false;
      }

      // Bedrooms filter
      if (filters.minBedrooms !== undefined && property.features.bedrooms < filters.minBedrooms) {
        return false;
      }
      if (filters.maxBedrooms !== undefined && property.features.bedrooms > filters.maxBedrooms) {
        return false;
      }

      // Bathrooms filter
      if (filters.minBathrooms !== undefined && property.features.bathrooms < filters.minBathrooms) {
        return false;
      }
      if (filters.maxBathrooms !== undefined && property.features.bathrooms > filters.maxBathrooms) {
        return false;
      }

      // Price filter (only for fixed price properties)
      if (property.price.type === "fixed") {
        if (filters.minPrice !== undefined && property.price.amount < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== undefined && property.price.amount > filters.maxPrice) {
          return false;
        }
      }

      // Suburb filter
      if (filters.suburbs && filters.suburbs.length > 0 && 
          !filters.suburbs.includes(property.location.suburb)) {
        return false;
      }

      // State filter
      if (filters.states && filters.states.length > 0 && 
          !filters.states.includes(property.location.state)) {
        return false;
      }

      return true;
    });
  }, [properties, filters]);
}

export function useProperty(propertyId: string | null) {
  const { data: allProperties, isLoading } = useAllProperties();
  
  return useMemo(() => {
    if (!propertyId || !allProperties) {
      return { data: undefined, isLoading };
    }
    
    return { 
      data: allProperties.find(p => p.id === propertyId),
      isLoading 
    };
  }, [propertyId, allProperties, isLoading]);
}