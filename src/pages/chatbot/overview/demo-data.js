import { MessageSquare, MessagesSquare } from "lucide-react";

export const chatbot = {
  name: "Atlas Support",
  status: "active",
  description: "Customer support assistant · Updated 12 minutes ago",
};

export const kpiStats = [
  {
    label: "Total conversations",
    value: 12480,
    change: 18.2,
    comparison: "vs. last month",
    icon: MessagesSquare,
    chart: [34, 45, 41, 58, 52, 67, 78, 72, 88, 96],
  },
  {
    label: "Total messages",
    value: 46892,
    change: 12.6,
    comparison: "vs. last month",
    icon: MessageSquare,
    chart: [28, 38, 36, 48, 57, 53, 70, 76, 82, 91],
  },
];

export const plan = {
  name: "Growth",
  renewalDate: "Renews Sep 20, 2026",
  chatbotUsage: { current: 3, limit: 5 },
  usage: [
    {
      label: "AI messages",
      current: 1420,
      limit: 2000,
      display: "1,420 / 2,000",
      tone: "primary",
    },
  ],
};

export const leadSummary = {
  isActive: true,
  total: 286,
  thisMonth: 74,
  qualified: 42,
  conversionRate: 18.4,
  recentTrend: [20, 35, 29, 47, 51, 43, 64, 72],
};

export const analytics = {
  totalThisPeriod: 3572,
  change: 14.8,
  conversationsOverTime: [
    { label: "Aug 14", value: 312 },
    { label: "Aug 15", value: 378 },
    { label: "Aug 16", value: 346 },
    { label: "Aug 17", value: 462 },
    { label: "Aug 18", value: 428 },
    { label: "Aug 19", value: 536 },
    { label: "Aug 20", value: 590 },
  ],
  visitors: {
    new: 64,
    returning: 36,
    newCount: 2286,
    returningCount: 1286,
  },
};

export const conversations = [
  {
    id: "conv-1042",
    name: "Maya Thompson",
    initials: "MT",
    lastMessage: "That fixed it, thank you so much!",
    time: "2m",
    channel: "WhatsApp",
    status: "AI handling",
    unread: 2,
  },
  {
    id: "conv-1041",
    name: "Daniel Kim",
    initials: "DK",
    lastMessage: "Can I change the delivery address?",
    time: "7m",
    channel: "Web chat",
    status: "Needs attention",
    unread: 1,
  },
  {
    id: "conv-1041",
    name: "Daniel Kim",
    initials: "DK",
    lastMessage: "Can I change the delivery address?",
    time: "7m",
    channel: "Web chat",
    status: "Needs attention",
    unread: 1,
  },
  {
    id: "conv-1041",
    name: "Daniel Kim",
    initials: "DK",
    lastMessage: "Can I change the delivery address?",
    time: "7m",
    channel: "Web chat",
    status: "Needs attention",
    unread: 1,
  },
  {
    id: "conv-1038",
    name: "Sofia Martins",
    initials: "SM",
    lastMessage: "What plans include team access?",
    time: "16m",
    channel: "Instagram",
    status: "AI handling",
    unread: 0,
  },
];

export const channels = [
  {
    id: "facebook",
    name: "Facebook",
    account: "Atlas Support",
    status: "connected",
    color: "bg-blue-600",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    account: "+1 (415) 555-0182",
    status: "connected",
    color: "bg-emerald-500",
  },
  {
    id: "instagram",
    name: "Instagram",
    account: "@atlas.support",
    status: "attention",
    color: "bg-gradient-to-br from-fuchsia-500 to-amber-400",
  },
];

export const unansweredQuestions = [
  {
    id: "question-1",
    question: "Can I transfer my account to another region?",
    time: "8 minutes ago",
    source: "Web chat",
    unread: true,
  },
  {
    id: "question-2",
    question: "Do you support SAML with custom role mapping?",
    time: "32 minutes ago",
    source: "WhatsApp",
    unread: true,
  },
  {
    id: "question-3",
    question: "How are refunds handled for annual plans?",
    time: "2 hours ago",
    source: "Facebook",
    unread: false,
  },
];
