import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronRight,
  CircleDot,
  LogOut,
  MessageSquare,
  Moon,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollContainer } from "@/components/ui/section";
import { userLoggedOut } from "@/features/auth/authSlice";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationListQuery,
} from "@/features/notification/notificationApiSlice";
import useAuth from "@/hooks/useAuth";
import { duration } from "@/lib/date-time";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { cn, getInitials, toArray } from "@/lib/utils";
import MenuToggle from "../menu-toggle";

const AVAILABILITY_STORAGE_KEY = "argon-user-availability";

const getStoredBoolean = (key, fallback = true) => {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? fallback : storedValue === "true";
  } catch {
    return fallback;
  }
};

const persistBoolean = (key, value) => {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // The preference still works for the current session.
  }
};

const Avatar = ({
  avatar,
  fullName,
  isAvailable,
  borderClassName,
  size = 10,
}) => (
  <span
    className={cn("relative block shrink-0 overflow-visible", `size-${size}`)}
  >
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary",
        `size-${size}`,
      )}
    >
      {avatar ? (
        <img
          src={getCloudinaryPreviewUrl(avatar, 120)}
          alt={`${fullName} avatar`}
          className="size-full object-cover"
        />
      ) : (
        getInitials(fullName)
      )}
    </span>
    <span
      aria-label={isAvailable ? "Online" : "Offline"}
      className={cn(
        "absolute -bottom-0.5 -right-0.5 z-20 size-3.5 rounded-full border-[3px]",
        borderClassName,
        isAvailable ? "bg-emerald-500" : "bg-muted-foreground",
      )}
    />
  </span>
);

const NavHeader = ({ className }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const {
    data: notificationResponse,
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useNotificationListQuery({ pageSize: 8 });
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAllRead }] =
    useMarkAllNotificationsReadMutation();
  const [isAvailable, setIsAvailable] = useState(() =>
    getStoredBoolean(AVAILABILITY_STORAGE_KEY),
  );

  const isDark = resolvedTheme === "dark";
  const fullName = user?.name || "Shahtaz Ahmed";
  const email = user?.email || "shahtaz@argon.ai";
  const avatar = user?.avatar_url || "";

  const notifications = toArray(notificationResponse?.data);
  const unreadCount =
    Number(notificationResponse?.meta?.unread_count) ||
    notifications.filter((notification) => !notification.is_read).length;

  const handlePreferenceChange = (setter, storageKey) => (nextValue) => {
    setter(nextValue);
    persistBoolean(storageKey, nextValue);
  };

  const handleNotificationRead = async (notification) => {
    if (notification.is_read) return;

    try {
      await markNotificationRead(notification.id).unwrap();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to mark the notification as read."),
      );
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead().unwrap();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to mark notifications as read."),
      );
    }
  };

  const handleLogout = () => {
    dispatch(userLoggedOut());
    navigate("/login", { replace: true });
  };

  return (
    <aside className={cn("fixed right-8 top-7 z-50", className)}>
      <div className="flex items-center gap-0.5 rounded-full border border-primary/20 bg-primary/10 p-1 backdrop-blur-xl">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              className="relative center size-10 rounded-full text-muted-foreground outline-none transition hover:bg-primary/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 center size-5 rounded-full border-2 border-background bg-red-500 px-1 text-[10px] font-bold leading-3.5 text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-[340px] rounded-2xl border-border/80 p-2 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {notificationsLoading
                    ? "Checking for updates…"
                    : unreadCount
                      ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                      : "You're all caught up"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllNotificationsRead}
                  disabled={isMarkingAllRead}
                  className="rounded-lg px-2 py-1 text-[11px] font-semibold text-primary outline-none transition hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-60"
                >
                  Mark all read
                </button>
              )}
            </div>

            <DropdownMenuSeparator />

            <ScrollContainer
              className="max-h-[min(360px,calc(100vh-180px))]"
              allowScrollChaining
            >
              <div className="py-1 pr-1">
                {notificationsLoading ? (
                  <div
                    className="space-y-2 px-2 py-1"
                    aria-label="Loading notifications"
                  >
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-16 animate-pulse rounded-xl bg-muted/70"
                      />
                    ))}
                  </div>
                ) : notificationsError ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-2 text-xs font-semibold">
                      Notifications unavailable
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Please try again in a moment.
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-2 text-xs font-semibold">
                      You’re all caught up
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      New notifications will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const isAiNotification =
                      notification.notification_type === "ai_notification";
                    const isMessageNotification =
                      notification.notification_type === "new_message";
                    const NotificationIcon = isAiNotification
                      ? Sparkles
                      : isMessageNotification
                        ? MessageSquare
                        : Bell;
                    const iconClassName = isAiNotification
                      ? "bg-violet-500/10 text-violet-600"
                      : isMessageNotification
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-emerald-500/10 text-emerald-600";

                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        onSelect={() => handleNotificationRead(notification)}
                        className="relative items-start gap-3 rounded-xl px-3 py-3"
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl",
                            iconClassName,
                          )}
                        >
                          <NotificationIcon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-foreground">
                            {notification.title}
                          </span>
                          <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
                            {notification.message}
                          </span>
                          <span className="mt-1.5 block text-[10px] text-muted-foreground/80">
                            {duration(notification.created_at)}
                          </span>
                        </span>
                        {!notification.is_read && (
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
            </ScrollContainer>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              className="p-1 rounded-full outline-none transition hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
            >
              <Avatar
                avatar={avatar}
                fullName={fullName}
                isAvailable={isAvailable}
                borderClassName="border-background"
                size={8}
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-[300px] rounded-2xl border-border/80 p-2 shadow-xl"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar
                avatar={avatar}
                fullName={fullName}
                isAvailable={isAvailable}
                borderClassName="border-popover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{fullName}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {email}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <div className="space-y-0.5 py-1">
              <MenuToggle
                checked={isAvailable}
                icon={<CircleDot className="size-4" />}
                label={isAvailable ? "Available" : "Unavailable"}
                description="Receive new conversations"
                onChange={handlePreferenceChange(
                  setIsAvailable,
                  AVAILABILITY_STORAGE_KEY,
                )}
              />
              <MenuToggle
                checked={isDark}
                icon={
                  isDark ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )
                }
                label="Dark mode"
                description={
                  isDark ? "Dark appearance is on" : "Light appearance is on"
                }
                onChange={(nextValue) => setTheme(nextValue ? "dark" : "light")}
              />
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
              <Link to="/profile" className="cursor-pointer">
                <UserRound />
                View profile
                <ChevronRight className="ml-auto" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
              <Link to="/workspace" className="cursor-pointer">
                <Building2 />
                Workspaces
                <ChevronRight className="ml-auto" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
              <Link to="/" className="cursor-pointer">
                <Sparkles />
                Chatbots
                <ChevronRight className="ml-auto" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="rounded-xl px-3 py-2.5"
              onSelect={handleLogout}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default NavHeader;
