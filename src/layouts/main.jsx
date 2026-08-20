import React from "react";
import SideMenu from "@/components/navbar";
import { Outlet, useLocation } from "react-router-dom";
import NavHeader from "@/components/navbar/nav-header";

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const hiddenSidebarRoutes = ["/", "/onboarding"];
  const isHidden = hiddenSidebarRoutes.includes(pathname);
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <SideMenu isHidden={isHidden} />
      <main className="h-screen min-w-0 flex-1 overflow-hidden bg-primary/10 dark:bg-primary/5 p-4">
        <div className="custom-scrollbar relative h-full min-w-0 overflow-x-hidden rounded-2xl bg-background p-8">
          <NavHeader className="absolute top-4 right-5" />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
