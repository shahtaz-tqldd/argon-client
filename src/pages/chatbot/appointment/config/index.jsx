import WeeklySchedule from "./schedule";
import BookingRules from "./rules";
import InfoCollect from "./info-collect";
import GoogleCalendar from "./google-calendar";
import { useAppointmentBookingConfigQuery } from "@/features/appointment-booking/appointmentBookingApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

function AppointmentConfigSkeleton() {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-5">
      {["lg:col-span-3", "lg:col-span-2"].map((className) => (
        <div key={className} className={className}>
          <Card className="animate-pulse p-0">
            <div className="border-b p-5">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="mt-2 h-3 w-64 max-w-full rounded bg-muted" />
            </div>
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-10 rounded-xl bg-muted" />
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

const AppointmentConfigTab = () => {
  const { chatbotSlug, currentChatbot } = useCurrentChatbot();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAppointmentBookingConfigQuery(
    { chatbotSlug },
    { skip: !chatbotSlug },
  );
  const config = data?.data;

  if (isLoading || (!config && !isError)) {
    return <AppointmentConfigSkeleton />;
  }

  if (isError) {
    return (
      <Card className="flex min-h-52 flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold">Unable to load booking settings</p>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          {getApiErrorMessage(error, "Please try again in a moment.")}
        </p>
        <Button className="mt-4" size="sm" variant="outline" onClick={refetch}>
          <RefreshCw /> Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-3">
        <InfoCollect chatbotSlug={chatbotSlug} config={config} />
        <WeeklySchedule
          chatbotSlug={chatbotSlug}
          timezone={currentChatbot?.timezone}
        />
      </div>
      <div className="space-y-5 lg:col-span-2">
        <BookingRules
          chatbotSlug={chatbotSlug}
          config={config}
          currentChatbot={currentChatbot}
        />
        <GoogleCalendar />
      </div>
    </div>
  );
};

export default AppointmentConfigTab;
