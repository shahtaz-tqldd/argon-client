import WeeklySchedule from "./schedule";
import BookingRules from "./rules";
import InfoCollect from "./info-collect";
import GoogleCalendar from "./google-calendar";

const AppointmentConfigTab = () => {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-5">
      <div className="space-y-5 col-span-3">
        <InfoCollect />
        <WeeklySchedule />
      </div>
      <div className="space-y-5 col-span-2">
        <BookingRules />
        <GoogleCalendar />
      </div>
    </div>
  );
};

export default AppointmentConfigTab;
