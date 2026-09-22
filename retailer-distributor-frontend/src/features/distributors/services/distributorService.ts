const API_URL = import.meta.env.VITE_API_URL;

export const getDistributorById = async (id: string) => {
  const response = await fetch(`${API_URL}/distributors/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch distributor");
  }

  return response.json();
};

export const getDistributorProductById = async (id: string) => {
  const response = await fetch(`${API_URL}/distributor-products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch distributor product");
  }

  return response.json();
};

export const getDistributorProducts = async (id: string) => {
  const response = await fetch(`${API_URL}/distributors/${id}/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch distributor product");
  }

  return response.json();
};
