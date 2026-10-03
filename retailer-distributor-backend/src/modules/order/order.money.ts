// Exact arithmetic on decimal strings ("10.50"), so order amounts are never
// rounded by floating point. Results carry no trailing zeros: "21", "31.5".

interface PricedQuantity {
  unitPrice: string;
  quantity: number;
}

const parseAmount = (amount: string): { value: bigint; scale: number } => {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(amount);

  if (!match) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const fraction = match[2] ?? "";

  return { value: BigInt(match[1] + fraction), scale: fraction.length };
};

const formatAmount = (value: bigint, scale: number): string => {
  const digits = value.toString().padStart(scale + 1, "0");
  const whole = digits.slice(0, digits.length - scale);
  const fraction = digits.slice(digits.length - scale).replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole;
};

// The exact sum of unitPrice x quantity over all items.
export const orderTotal = (items: PricedQuantity[]): string => {
  const lines = items.map((item) => ({
    ...parseAmount(item.unitPrice),
    quantity: BigInt(item.quantity),
  }));
  const scale = Math.max(0, ...lines.map((line) => line.scale));

  const total = lines.reduce(
    (sum, line) =>
      sum + line.value * 10n ** BigInt(scale - line.scale) * line.quantity,
    0n,
  );

  return formatAmount(total, scale);
};

export const lineTotal = (unitPrice: string, quantity: number): string =>
  orderTotal([{ unitPrice, quantity }]);
