import {
  CalendarCheck2,
  CalendarX2,
  Clock3,
  UserRoundCheck,
} from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { useAppointmentStatsQuery } from "@/features/appointment/appointmentApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";

const AppointmentStats = ({ chatbotSlug: slugProp }) => {
  const { chatbotSlug: currentSlug } = useCurrentChatbot();
  const chatbotSlug = slugProp || currentSlug;

  const { data, isLoading } = useAppointmentStatsQuery(
    { chatbotSlug },
    { skip: !chatbotSlug },
  );

  const stats = data?.data ?? {};
  const total = Number(stats.total) || 0;
  const booked = Number(stats.booked) || 0;
  const confirmed = Number(stats.confirmed) || 0;
  const cancelled = Number(stats.cancelled) || 0;
  const cancellationRate = total ? Math.round((cancelled / total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={CalendarCheck2}
        label="Total appointments"
        value={isLoading ? "—" : total}
        detail="All bookings for this chatbot"
        tone="bg-primary/10 text-primary"
        badge={<span className="size-2 rounded-full bg-primary" />}
      />
      <MetricCard
        icon={Clock3}
        label="Booked"
        value={isLoading ? "—" : booked}
        detail="Awaiting confirmation"
        tone="bg-amber-500/10 text-amber-600"
        badge={<span className="size-2 rounded-full bg-amber-500" />}
      />
      <MetricCard
        icon={UserRoundCheck}
        label="Confirmed"
        value={isLoading ? "—" : confirmed}
        detail="Confirmed and ready to attend"
        tone="bg-emerald-500/10 text-emerald-600"
        badge={<span className="size-2 rounded-full bg-emerald-500" />}
      />
      <MetricCard
        icon={CalendarX2}
        label="Cancelled"
        value={isLoading ? "—" : cancelled}
        detail={`${cancellationRate}% cancellation rate`}
        tone="bg-red-500/10 text-red-600"
        badge={<span className="size-2 rounded-full bg-red-500" />}
      />
    </div>
  );
};

export default AppointmentStats;
