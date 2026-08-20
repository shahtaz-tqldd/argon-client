import {
  LayoutDashboard,
  Settings2,
  Users2,
  MessageCircle,
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
    label: "Inbox",
    link: "/inbox",
    icon: <MessageCircle size={18} />,
  },
  {
    id: 3,
    label: "Configuration",
    link: "/destinations",
    icon: <Settings2 size={18} />,
  },
  {
    id: 4,
    label: "Team",
    link: "/team",
    icon: <Users2 size={18} />,
  },
];
