import React from "react";
import { cn, getInitials } from "@/lib/utils";
import { Mail, ShieldCheck } from "lucide-react";

const SectionTitle = ({ title, details, icon: Icon = null, lg = false }) => {
  return (
    <div className="flex items-start gap-4">
      {Icon && (
        <div
          className={cn(
            "flex  shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary",
            lg ? "size-14" : "size-11",
          )}
        >
          <Icon className={cn(lg ? "size-6" : "size-5")} />
        </div>
      )}
      <div>
        <h2
          className={cn(
            "font-semibold text-foreground",
            lg ? "text-2xl" : "text-base",
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "mt-1 text-muted-foreground",
            lg ? "text-md" : "text-sm",
          )}
        >
          {details}
        </p>
      </div>
    </div>
  );
};

const DialogHeaderTitle = ({
  title,
  details,
  icon: Icon = null,
  header = null,
}) => {
  if (header) return header;
  return (
    <div className="flex flex-col items-start gap-3">
      {Icon && (
        <div
          className={cn(
            "flex  shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary",
            "size-11",
          )}
        >
          <Icon className={cn("size-5")} />
        </div>
      )}
      <div>
        <h2 className={cn("font-semibold text-foreground", "text-base")}>
          {title}
        </h2>
        <p className={cn("mt-1 text-muted-foreground", "text-sm")}>{details}</p>
      </div>
    </div>
  );
};

const UserProfile = ({ person }) => {
  const isInvitation = person.type === "invitation";

  return (
    <div className="flex min-w-52 items-center gap-3">
      <div className="relative shrink-0">
        {person.avatar && !isInvitation ? (
          <img
            src={person.avatar}
            alt=""
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-xs font-bold",
              isInvitation
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-primary/10 text-primary",
            )}
          >
            {isInvitation ? (
              <Mail className="size-4" />
            ) : (
              getInitials(person.name || person.email)
            )}
          </span>
        )}
        {person.status === "Active" && (
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {person.name}
          </p>
          {person.role === "Admin" && (
            <ShieldCheck className="size-3.5 text-primary" />
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {person.email}
        </p>
      </div>
    </div>
  );
};

export { SectionTitle, DialogHeaderTitle, UserProfile };
