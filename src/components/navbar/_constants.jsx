import {
  LayoutDashboard,
  Settings2,
  Users2,
  MessageCircle,
  UserRoundSearch,
  CalendarDays,
  Currency,
} from "lucide-react";

export const getSidebarItems = (
  chatbotSlug,
  isLeadCollectActive = false,
  isAppointmentBookingActive = false,
) => {
  const items = [
    {
      label: "Overview",
      link: `/chatbot/${chatbotSlug}/`,
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Inbox",
      link: `/chatbot/${chatbotSlug}/chat-session`,
      icon: <MessageCircle size={18} />,
    },
  ];

  if (isLeadCollectActive) {
    items.push({
      label: "Lead Captures",
      link: `/chatbot/${chatbotSlug}/leads`,
      icon: <UserRoundSearch size={18} />,
    });
  }

  if (isAppointmentBookingActive) {
    items.push({
      label: "Appointments",
      link: `/chatbot/${chatbotSlug}/appointments`,
      icon: <CalendarDays size={18} />,
    });
  }

  items.push(
    {
      label: "Configuration",
      link: `/chatbot/${chatbotSlug}/configuration`,
      icon: <Settings2 size={18} />,
    },
    {
      label: "Team",
      link: `/chatbot/${chatbotSlug}/team`,
      icon: <Users2 size={18} />,
    },
    {
      label: "Plan & Billing",
      link: `/chatbot/${chatbotSlug}/plan-and-billing`,
      icon: <Currency size={18} />,
    },
  );

  return items.map((item, index) => ({
    ...item,
    id: index + 1,
  }));
};
