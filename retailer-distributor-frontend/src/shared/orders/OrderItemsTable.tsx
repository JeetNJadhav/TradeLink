import type { OrderLineItem } from "./types";

interface OrderItemsTableProps {
  items: OrderLineItem[];
  totalAmount: string;
}

// The products of an order with their amounts and the order total.
const OrderItemsTable = ({ items, totalAmount }: OrderItemsTableProps) => (
  <table className="order-items">
    <thead>
      <tr>
        <th>Product</th>
        <th>Brand</th>
        <th className="is-numeric">Quantity</th>
        <th className="is-numeric">Unit Price</th>
        <th className="is-numeric">Amount</th>
      </tr>
    </thead>

    <tbody>
      {items.map((item) => (
        <tr key={item.id}>
          <td>{item.product.name}</td>
          <td>{item.product.brand}</td>
          <td className="is-numeric">{item.quantity}</td>
          <td className="is-numeric">₹{item.unitPrice}</td>
          <td className="is-numeric">₹{item.lineTotal}</td>
        </tr>
      ))}
    </tbody>

    <tfoot>
      <tr>
        <th colSpan={4} scope="row">
          Total
        </th>
        <td className="is-numeric">₹{totalAmount}</td>
      </tr>
    </tfoot>
  </table>
);

export default OrderItemsTable;
