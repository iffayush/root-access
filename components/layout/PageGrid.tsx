import type { ComponentProps } from "react";

type PageGridProps = ComponentProps<"div">;

export function PageGrid({ className, children, ...props }: PageGridProps) {
  const classes = className ? `page-grid ${className}` : "page-grid";

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
