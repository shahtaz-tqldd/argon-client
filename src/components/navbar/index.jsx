import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AppLogo from "../ui/logo";

import { useGetWorkspaceQuery } from "@/features/workspace/workspaceApiSlice";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { getInitials } from "@/lib/utils";
import { getSidebarItems } from "./_constants";

const SideMenu = ({ isHidden = false }) => {
  const location = useLocation();
  const { chatbotSlug } = useParams();
  const { data: workspaceResponse } = useGetWorkspaceQuery();
  const workspace = workspaceResponse?.data;
  const workspaceName = workspace?.name || "Workspace";
  const workspaceLogo = workspace?.logo || "";

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

      <Link
        to="/"
        aria-label={`Open ${workspaceName}`}
        className="w-full flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 p-3 transition-colors hover:bg-background"
      >
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
          {workspaceLogo ? (
            <img
              src={getCloudinaryPreviewUrl(workspaceLogo, 120)}
              alt={`${workspaceName} logo`}
              className="size-full object-cover"
            />
          ) : (
            getInitials(workspaceName)
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {workspaceName}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {workspace?.industry || "Workspace"}
          </span>
        </span>
      </Link>
    </div>
  );
};

export default SideMenu;
