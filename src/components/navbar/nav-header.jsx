import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userLoggedOut } from "@/features/auth/authSlice";
import useAuth from "@/hooks/useAuth";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { cn, getInitials } from "@/lib/utils";

const AVAILABILITY_STORAGE_KEY = "argon-user-availability";

const getInitialAvailability = () => {
  try {
    return window.localStorage.getItem(AVAILABILITY_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
};

const MenuToggle = ({ checked, icon, label, description, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
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

const NavHeader = ({ className }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [isAvailable, setIsAvailable] = useState(getInitialAvailability);

  const isDark = resolvedTheme === "dark";
  const fullName = user?.name || "Shahtaz Ahmed";
  const email = user?.email || "shahtaz@argon.ai";
  const avatar = user?.avatar_url || "";

  const handleAvailabilityChange = (nextValue) => {
    setIsAvailable(nextValue);
    try {
      window.localStorage.setItem(AVAILABILITY_STORAGE_KEY, String(nextValue));
    } catch {
      // The preference still works for the current session.
    }
  };

  const handleLogout = () => {
    dispatch(userLoggedOut());
    navigate("/login", { replace: true });
  };

  return (
    <aside className={cn("fixed right-6 top-6 z-50", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open account menu"
            className="group flex items-center gap-1 rounded-full border border-border/70 bg-background/90 p-1 shadow-md backdrop-blur-xl transition hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {avatar ? (
                <img
                  src={getCloudinaryPreviewUrl(avatar, 120)}
                  alt={`${fullName} avatar`}
                  className="size-full object-cover"
                />
              ) : (
                getInitials(fullName)
              )}
              <span
                className={cn(
                  "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background",
                  isAvailable ? "bg-emerald-500" : "bg-muted-foreground",
                )}
              />
            </span>
            <ChevronDown className="mr-1 size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[300px] rounded-2xl border-border/80 p-2 shadow-xl"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {avatar ? (
                <img
                  src={getCloudinaryPreviewUrl(avatar, 120)}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                getInitials(fullName)
              )}
              <span
                className={cn(
                  "absolute bottom-0 right-0 size-3 rounded-full border-2 border-popover",
                  isAvailable ? "bg-emerald-500" : "bg-muted-foreground",
                )}
              />
            </span>
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
              onChange={handleAvailabilityChange}
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
    </aside>
  );
};

export default NavHeader;
