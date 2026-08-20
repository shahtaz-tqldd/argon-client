import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AppLogo from "../ui/logo";

import useAuth from "@/hooks/useAuth";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { getSidebarItems } from "./_constants";

const SideMenu = ({ isHidden = false }) => {
  const location = useLocation();
  const { chatbotSlug } = useParams();
  const { user } = useAuth();
  const fullName = user?.name;
  const avatar = user?.avatar_url || "";

  if (isHidden) return null;

  // navmenu items
  const isLeadCollectActive = true;
  const isAppointmentBookingActive = true;

  const navMenu = getSidebarItems(
    chatbotSlug,
    isLeadCollectActive,
    isAppointmentBookingActive,
  );

  return (
    <div className="flex h-screen w-[240px] shrink-0 flex-col justify-between bg-primary/10 p-6 pr-2 dark:bg-primary/5">
      <div className="space-y-6">
        <AppLogo />
        <ul className="space-y-1 w-full">
          {navMenu.map((item) => {
            const currentPath = location.pathname.replace(/\/+$/, "");
            const itemPath = item.link.replace(/\/+$/, "");
            const isOverview = item.label === "Overview";
            const isActive = isOverview
              ? currentPath === itemPath
              : item.link === "/"
                ? location.pathname === item.link
                : location.pathname.startsWith(item.link);

            return (
              <li key={item.id}>
                <Link
                  to={item.link}
                  className={`flex items-center font-medium gap-3 px-4 py-3 w-full text-sm rounded-full transition-all
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-primary hover:bg-primary/10"
                  }
                `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-background/60 p-3">
        <img
          src={getCloudinaryPreviewUrl(avatar, 120)}
          className="size-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <h2 className="text-sm font-medium text-foreground">{fullName}</h2>
          <p className="text-xs text-muted-foreground">Super Admin</p>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
