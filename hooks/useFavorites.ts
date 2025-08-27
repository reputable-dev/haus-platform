import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Property } from "@/types/property";

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const storedFavorites = await AsyncStorage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const addFavorite = async (propertyId: string) => {
    if (!favorites.includes(propertyId)) {
      const newFavorites = [...favorites, propertyId];
      await saveFavorites(newFavorites);
    }
  };

  const removeFavorite = async (propertyId: string) => {
    const newFavorites = favorites.filter(id => id !== propertyId);
    await saveFavorites(newFavorites);
  };

  const toggleFavorite = async (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      await removeFavorite(propertyId);
    } else {
      await addFavorite(propertyId);
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    return favorites.includes(propertyId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
});

export function useFavoriteProperties(properties: Property[]): Property[] {
  const { favorites } = useFavorites();
  
  return properties.filter(property => favorites.includes(property.id));
}