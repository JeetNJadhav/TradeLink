const API_URL = import.meta.env.VITE_API_URL;

export interface ProductSearchParams {
  query: string;
  latitude?: number;
  longitude?: number;
  sortBy?: "relevance" | "nearest";
}

export const searchProducts = async ({
  query,
  latitude,
  longitude,
  sortBy,
}: ProductSearchParams) => {
  const params = new URLSearchParams();

  params.set("q", query);

  if (latitude !== undefined) {
    params.set("latitude", latitude.toString());
  }

  if (longitude !== undefined) {
    params.set("longitude", longitude.toString());
  }

  if (sortBy) {
    params.set("sortBy", sortBy);
  }

  const response = await fetch(
    `${API_URL}/products/search?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to search products");
  }

  return response.json();
};

export const getProductSuggestions = async (
  query: string,
  signal?: AbortSignal,
) => {
  const params = new URLSearchParams({
    q: query,
  });

  const response = await fetch(
    `${API_URL}/products/suggestions?${params.toString()}`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product suggestions");
  }

  return response.json();
};
