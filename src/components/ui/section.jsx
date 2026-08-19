import React from "react";

const SectionTitle = ({ title, details, icon: Icon = null }) => {
  return (
    <div className="flex items-start gap-4">
      {Icon && (
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      )}
      <div>
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{details}</p>
      </div>
    </div>
  );
};

export { SectionTitle };
