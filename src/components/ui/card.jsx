import { cn } from "@/lib/utils";
import React from "react";

const Card = ({ children, className }) => {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
