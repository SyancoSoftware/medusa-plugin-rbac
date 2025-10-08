import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { TestMyAuthorization } from "../lib/authorization";

const ProductsUnauthorized = () => {
  return <TestMyAuthorization urlToTest="/admin/products" />;
};

export const config = defineWidgetConfig({
  zone: "product.list.before",
});

export default ProductsUnauthorized;
