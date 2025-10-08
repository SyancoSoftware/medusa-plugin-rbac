import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { TestMyAuthorization } from "../lib/authorization";

const PriceListsUnauthorized = () => {
  return <TestMyAuthorization urlToTest="/admin/price-lists" />;
};

export const config = defineWidgetConfig({
  zone: "price_list.list.before",
});

export default PriceListsUnauthorized;
