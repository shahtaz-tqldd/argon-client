import { BotMessageSquare, Compass, MapPinned, UsersRound } from "lucide-react";

export const OVERVIEW_STATS = [
  {
    title: "Total Users",
    value: "3,240",
    highlight: "+128 users this month",
    description: "Travelers who created an account",
    change: "4.2%",
    icon: UsersRound,
  },
  {
    title: "Trips Planned",
    value: "1,186",
    highlight: "86 new itineraries",
    description: "AI-generated and saved travel plans",
    change: "7.8%",
    icon: Compass,
  },
  {
    title: "Destinations",
    value: "42",
    highlight: "6 added recently",
    description: "Available places users can explore",
    change: "16%",
    icon: MapPinned,
  },
  {
    title: "AI Conversations",
    value: "32.1K",
    highlight: "2.4K messages this month",
    description: "Messages handled by the travel agent",
    change: "9.5%",
    icon: BotMessageSquare,
  },
];
