import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  Bot,
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
import { userLoggedOut } from "@/features/auth/authSlice";
import {
  useChatbotDetailsQuery,
  useUpdateChatbotMutation,
} from "@/features/chatbot/chatbotApiSlice";
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

const AVAILABILITY_STORAGE_KEY = "argon-user-availability";
const CHATBOT_ENABLED_STORAGE_KEY = "argon-chatbot-enabled";
const AI_REPLY_STORAGE_KEY = "argon-ai-reply-enabled";

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

const MenuToggle = ({
  checked,
  disabled = false,
  icon,
  label,
  description,
  onChange,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-60"
  >
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">
        {description}
      </span>
    </span>
    <span
      aria-hidden="true"
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/25",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </span>
  </button>
);

const Avatar = ({ avatar, fullName, isAvailable, borderClassName }) => (
  <span className="relative block size-10 shrink-0 overflow-visible">
    <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
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
  const { chatbotSlug } = useParams();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const { data: chatbotResponse } = useChatbotDetailsQuery(
    { chatbotSlug },
    { skip: !chatbotSlug },
  );

  const [updateChatbot, { isLoading: isUpdatingChatbot }] =
    useUpdateChatbotMutation();
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
  const [storedChatbotEnabled, setStoredChatbotEnabled] = useState(() =>
    getStoredBoolean(CHATBOT_ENABLED_STORAGE_KEY),
  );
  const [chatbotEnabledOverrides, setChatbotEnabledOverrides] = useState({});
  const [isAiReplyEnabled, setIsAiReplyEnabled] = useState(() =>
    getStoredBoolean(AI_REPLY_STORAGE_KEY),
  );

  const isDark = resolvedTheme === "dark";
  const fullName = user?.name || "Shahtaz Ahmed";
  const email = user?.email || "shahtaz@argon.ai";
  const avatar = user?.avatar_url || "";

  const activeChatbot = chatbotResponse?.data;
  const chatbotStateKey = chatbotSlug || "default";
  const serverChatbotEnabled = activeChatbot
    ? activeChatbot.status === "active"
    : storedChatbotEnabled;
  const isChatbotEnabled =
    chatbotEnabledOverrides[chatbotStateKey] ?? serverChatbotEnabled;
  const chatbotName = activeChatbot?.name || "Atlas Support";
  const chatbotLogo = activeChatbot?.logo || "";
  const notifications = toArray(notificationResponse?.data);
  const unreadCount =
    Number(notificationResponse?.meta?.unread_count) ||
    notifications.filter((notification) => !notification.is_read).length;

  const handlePreferenceChange = (setter, storageKey) => (nextValue) => {
    setter(nextValue);
    persistBoolean(storageKey, nextValue);
  };

  const handleChatbotEnabledChange = async (nextValue) => {
    setStoredChatbotEnabled(nextValue);
    setChatbotEnabledOverrides((current) => ({
      ...current,
      [chatbotStateKey]: nextValue,
    }));
    persistBoolean(CHATBOT_ENABLED_STORAGE_KEY, nextValue);

    if (!activeChatbot || !chatbotSlug) return;

    try {
      await updateChatbot({
        chatbotSlug,
        payload: { status: nextValue ? "active" : "disabled" },
      }).unwrap();
      toast.success(nextValue ? "Chatbot enabled" : "Chatbot disabled");
    } catch (error) {
      const previousValue = !nextValue;
      setStoredChatbotEnabled(previousValue);
      setChatbotEnabledOverrides((current) => ({
        ...current,
        [chatbotStateKey]: previousValue,
      }));
      persistBoolean(CHATBOT_ENABLED_STORAGE_KEY, previousValue);
      toast.error(getApiErrorMessage(error, "Unable to update the chatbot."));
    }
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
      <div className="p-1 flex items-center overflow-hidden rounded-full border border-border/70 bg-background/50 shadow-sm backdrop-blur-xl">
        {chatbotSlug ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Manage ${chatbotName}`}
                className="group flex min-w-0 items-center gap-2.5 rounded-full p-2 text-left outline-none transition hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
              >
                <span className="flex size-9 shrink-0 center overflow-hidden rounded-full bg-primary/10 text-primary">
                  {chatbotLogo ? (
                    <img
                      src={getCloudinaryPreviewUrl(chatbotLogo, 120)}
                      alt={`${chatbotName} logo`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Bot className="size-5" />
                  )}
                </span>
                <span className="min-w-0 pr-1">
                  <span className="block max-w-36 truncate text-xs font-semibold text-foreground">
                    {chatbotName}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex items-center gap-1.5 text-[10px] font-medium",
                      isChatbotEnabled
                        ? "text-emerald-600"
                        : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isChatbotEnabled
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/60",
                      )}
                    />
                    {isChatbotEnabled ? "Active" : "Inactive"}
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[310px] rounded-2xl border-border/80 p-2 shadow-xl"
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                  {chatbotLogo ? (
                    <img
                      src={getCloudinaryPreviewUrl(chatbotLogo, 120)}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <Bot className="size-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {chatbotName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Chatbot controls
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    isChatbotEnabled
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {isChatbotEnabled ? "Active" : "Inactive"}
                </span>
              </div>

              <DropdownMenuSeparator />

              <div className="space-y-0.5 py-1">
                <MenuToggle
                  checked={isChatbotEnabled}
                  disabled={isUpdatingChatbot}
                  icon={<Bot className="size-4" />}
                  label="Enable chatbot"
                  description={
                    isChatbotEnabled
                      ? "Available to receive messages"
                      : "Hidden from your connected channels"
                  }
                  onChange={handleChatbotEnabledChange}
                />
                <MenuToggle
                  checked={isAiReplyEnabled}
                  icon={<Sparkles className="size-4" />}
                  label="AI replies"
                  description={
                    isAiReplyEnabled
                      ? "AI can respond automatically"
                      : "Only teammates can send replies"
                  }
                  onChange={handlePreferenceChange(
                    setIsAiReplyEnabled,
                    AI_REPLY_STORAGE_KEY,
                  )}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              className="relative center size-14 rounded-full text-muted-foreground outline-none transition hover:bg-accent/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex min-w-4.5 items-center justify-center rounded-full border-2 border-background bg-red-500 px-1 text-[9px] font-bold leading-3.5 text-white">
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
                      : "You’re all caught up"}
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

            <div className="py-1">
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
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              className="p-2 rounded-full outline-none transition hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
            >
              <Avatar
                avatar={avatar}
                fullName={fullName}
                isAvailable={isAvailable}
                borderClassName="border-background"
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
