import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { TestMyAuthorization } from "../lib/authorization";

const CustomersUnAuthorized = () => {
  return <TestMyAuthorization urlToTest="/admin/customers" />;
};

export const config = defineWidgetConfig({
  zone: "customer.list.before",
});

export default CustomersUnAuthorized;
