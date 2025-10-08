import React from "react";

const spacingToPx = (value?: number) =>
  typeof value === "number" ? `${value * 8}px` : undefined;

type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  container?: boolean;
  direction?: "row" | "column";
  spacing?: number;
  rowSpacing?: number;
  columnSpacing?: number;
  alignItems?: React.CSSProperties["alignItems"];
  justifyContent?: React.CSSProperties["justifyContent"];
  paddingRight?: number;
  paddingLeft?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginRight?: number;
  marginLeft?: number;
  marginTop?: number;
  marginBottom?: number;
  size?: number;
  wrap?: "wrap" | "nowrap";
};

export const Grid: React.FC<GridProps> = ({
  container,
  direction = "row",
  spacing,
  rowSpacing,
  columnSpacing,
  alignItems,
  justifyContent,
  paddingRight,
  paddingLeft,
  paddingTop,
  paddingBottom,
  marginRight,
  marginLeft,
  marginTop,
  marginBottom,
  size,
  wrap = "wrap",
  style,
  className,
  children,
  ...rest
}) => {
  const computedStyle: React.CSSProperties = {
    ...style,
  };

  if (container) {
    computedStyle.display = "flex";
    computedStyle.flexDirection = direction;
    if (alignItems) {
      computedStyle.alignItems = alignItems;
    }
    if (justifyContent) {
      computedStyle.justifyContent = justifyContent;
    }
    computedStyle.flexWrap = wrap;
    if (rowSpacing !== undefined || columnSpacing !== undefined) {
      computedStyle.rowGap = spacingToPx(rowSpacing);
      computedStyle.columnGap = spacingToPx(columnSpacing);
    } else if (spacing !== undefined) {
      computedStyle.gap = spacingToPx(spacing);
    }
  } else if (size) {
    const width = `${(size / 12) * 100}%`;
    computedStyle.flex = `0 0 ${width}`;
    computedStyle.maxWidth = width;
  }

  if (paddingTop !== undefined) {
    computedStyle.paddingTop = spacingToPx(paddingTop);
  }
  if (paddingRight !== undefined) {
    computedStyle.paddingRight = spacingToPx(paddingRight);
  }
  if (paddingBottom !== undefined) {
    computedStyle.paddingBottom = spacingToPx(paddingBottom);
  }
  if (paddingLeft !== undefined) {
    computedStyle.paddingLeft = spacingToPx(paddingLeft);
  }
  if (marginTop !== undefined) {
    computedStyle.marginTop = spacingToPx(marginTop);
  }
  if (marginRight !== undefined) {
    computedStyle.marginRight = spacingToPx(marginRight);
  }
  if (marginBottom !== undefined) {
    computedStyle.marginBottom = spacingToPx(marginBottom);
  }
  if (marginLeft !== undefined) {
    computedStyle.marginLeft = spacingToPx(marginLeft);
  }

  return (
    <div className={className} style={computedStyle} {...rest}>
      {children}
    </div>
  );
};
