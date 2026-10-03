import { describe, expect, it } from "vitest";
import { lineTotal, orderTotal } from "../src/modules/order/order.money";

describe("order money", () => {
  it("multiplies a price by a quantity without rounding", () => {
    expect(lineTotal("10.50", 3)).toBe("31.5");
    expect(lineTotal("0.1", 3)).toBe("0.3");
    expect(lineTotal("19.99", 1000000)).toBe("19990000");
  });

  it("sums items whose prices have different numbers of decimals", () => {
    expect(
      orderTotal([
        { unitPrice: "10.5", quantity: 3 },
        { unitPrice: "4", quantity: 2 },
        { unitPrice: "0.125", quantity: 1 },
      ]),
    ).toBe("39.625");
  });

  it("drops trailing zeros and keeps a leading zero", () => {
    expect(orderTotal([{ unitPrice: "4.00", quantity: 2 }])).toBe("8");
    expect(orderTotal([{ unitPrice: "0.05", quantity: 1 }])).toBe("0.05");
    expect(orderTotal([])).toBe("0");
  });

  it("refuses a value that is not a plain decimal", () => {
    expect(() => lineTotal("1e3", 1)).toThrow("Invalid amount");
    expect(() => lineTotal("-5", 1)).toThrow("Invalid amount");
  });
});
