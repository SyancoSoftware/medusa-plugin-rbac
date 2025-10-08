import React from "react";
import { Spinner as SpinnerIcon } from "@medusajs/icons";

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <SpinnerIcon
    className="inline-block animate-spin text-ui-fg-subtle"
    style={{ width: size, height: size }}
    aria-hidden="true"
  />
);
