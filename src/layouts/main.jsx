import { useEffect, useLayoutEffect, useRef } from "react";
import SideMenu from "@/components/navbar";
import { Outlet, useLocation } from "react-router-dom";
import NavHeader from "@/components/navbar/nav-header";
import { useNotificationListQuery } from "@/features/notification/notificationApiSlice";
import useDashboardSocket from "@/hooks/useDashboardSocket";
import useLastVisitedChatbot from "@/hooks/useLastVisitedChatbot";
import { setUnreadNotificationCount } from "@/lib/document-title";
import { toArray } from "@/lib/utils";

const DashboardLayout = () => {
  useDashboardSocket();
  useLastVisitedChatbot();
  const { data: notificationResponse } = useNotificationListQuery({
    pageSize: 8,
  });
  const { pathname } = useLocation();
  const scrollContainerRef = useRef(null);
  const hiddenSidebarRoutes = ["/", "/onboarding", "/profile"];
  const isHidden = hiddenSidebarRoutes.includes(pathname);
  const notifications = toArray(notificationResponse?.data);
  const unreadCount =
    Number(notificationResponse?.meta?.unread_count) ||
    notifications.filter((notification) => !notification.is_read).length;

  useEffect(() => {
    setUnreadNotificationCount(unreadCount);
  }, [unreadCount]);

  useEffect(
    () => () => {
      setUnreadNotificationCount(0);
    },
    [],
  );

  useLayoutEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <SideMenu isHidden={isHidden} />
      <main className="h-screen min-w-0 flex-1 overflow-hidden bg-primary/10 dark:bg-primary/5 p-4">
        <div
          ref={scrollContainerRef}
          className="custom-scrollbar relative h-full min-w-0 overflow-x-hidden rounded-2xl bg-background p-8"
        >
          <NavHeader />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
