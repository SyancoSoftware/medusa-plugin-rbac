import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { TestMyAuthorization } from "../lib/authorization";

const OrdersUnauthorized = () => {
  return <TestMyAuthorization urlToTest="/admin/orders" />;
};

export const config = defineWidgetConfig({
  zone: "order.list.before",
});

export default OrdersUnauthorized;
