import {
  LayoutDashboard,
  Users,
  PlaneTakeoff,
  Settings,
  CalendarDays,
  Coins,
  FlagTriangleRight,
  User,
} from "lucide-react";

export const NAVMENU_ITEMS = [
  {
    id: 1,
    label: "Overview",
    link: "/",
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 2,
    label: "Users",
    link: "/users",
    icon: <Users size={18} />,
  },
  {
    id: 3,
    label: "Destinations",
    link: "/destinations",
    icon: <PlaneTakeoff size={18} />,
  },
  {
    id: 4,
    label: "Trips",
    link: "/trips",
    icon: <CalendarDays size={18} />,
  },
  {
    id: 5,
    label: "Credit Requests",
    link: "/credit-requests",
    icon: <Coins size={18} />,
  },
  {
    id: 6,
    label: "Reported Content",
    link: "/reported-content",
    icon: <FlagTriangleRight size={18} />,
  },
  {
    id: 7,
    label: "App Config",
    link: "/app-config",
    icon: <Settings size={18} />,
  },
  {
    id: 8,
    label: "Account Settings",
    link: "/account-settings",
    icon: <User size={18} />,
  },
];
