const API_URL = import.meta.env.VITE_API_URL;

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  distributorId: string;
  items: CreateOrderItem[];
}

export const createOrder = async (payload: CreateOrderRequest) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to place order");
  }

  return data;
};
