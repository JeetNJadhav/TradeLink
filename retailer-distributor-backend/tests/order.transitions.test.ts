import { describe, expect, it } from "vitest";
import {
  canTransition,
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
} from "../src/modules/order/order.transitions";

describe("order transitions", () => {
  it("lets a pending order be accepted, rejected or cancelled", () => {
    expect(canTransition("PENDING", "ACCEPTED")).toBe(true);
    expect(canTransition("PENDING", "REJECTED")).toBe(true);
    expect(canTransition("PENDING", "CANCELLED")).toBe(true);
  });

  it("does not let an order skip steps", () => {
    expect(canTransition("PENDING", "SHIPPED")).toBe(false);
    expect(canTransition("ACCEPTED", "DELIVERED")).toBe(false);
  });

  it("does not let an order move backwards", () => {
    expect(canTransition("ACCEPTED", "PENDING")).toBe(false);
    expect(canTransition("SHIPPED", "PROCESSING")).toBe(false);
  });

  it.each(["REJECTED", "DELIVERED", "CANCELLED"] as const)(
    "treats %s as final",
    (status) => {
      expect(ORDER_TRANSITIONS[status]).toEqual([]);

      for (const next of ORDER_STATUSES) {
        expect(canTransition(status, next)).toBe(false);
      }
    },
  );

  it("lists every status", () => {
    expect([...ORDER_STATUSES].sort()).toEqual([
      "ACCEPTED",
      "CANCELLED",
      "DELIVERED",
      "PENDING",
      "PROCESSING",
      "REJECTED",
      "SHIPPED",
    ]);
  });
});
