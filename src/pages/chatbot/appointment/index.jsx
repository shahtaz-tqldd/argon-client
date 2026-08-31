import { useState } from "react";
import { CalendarDays, Settings2 } from "lucide-react";
import TabMenu from "@/components/ui/tab";
import Container from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section";
import AppointmentConfigTab from "./config";
import AppointmentListTab from "./appointment-list";

const pageTabs = [
  {
    value: "appointments",
    label: "Appointments",
    icon: CalendarDays,
    count: 6,
  },
  { value: "settings", label: "Settings", icon: Settings2 },
];

const AppointmentBookingPage = () => {
  const [activeTab, setActiveTab] = useState("appointments");

  return (
    <Container>
      <SectionTitle
        icon={CalendarDays}
        title="Appointment booking"
        details="Manage and Configure appointment booking through the chatbot"
        lg
      />

      <TabMenu
        tabs={pageTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="w-fit"
      />
      {activeTab === "appointments" && <AppointmentListTab />}
      {activeTab === "settings" && <AppointmentConfigTab />}
    </Container>
  );
};

export default AppointmentBookingPage;
