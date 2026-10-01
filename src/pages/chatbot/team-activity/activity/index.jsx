import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import ReusableTable from "@/components/table";
import { UserProfile } from "@/components/ui/section";
import { useChatbotActivityListQuery } from "@/features/chatbot/chatbotApiSlice";
import { formatDateTime } from "@/lib/date-time";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const normalizeUser = (user) => {
  if (!user || typeof user !== "object") {
    const label = typeof user === "string" ? user : "Unknown user";
    return { name: label, email: "" };
  }

  return {
    ...user,
    name: user.name?.trim() || user.email?.split("@")[0] || "Unknown user",
    email: user.email || "",
    avatar_url: user.avatar_url || user.avatar || "",
  };
};

const ActivityList = () => {
  const { chatbotSlug } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching, isError, error } =
    useChatbotActivityListQuery({ chatbotSlug, page, pageSize });

  const activities = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data],
  );

  const rows = activities.map((activity) => ({
    id: activity.id,
    user: <UserProfile person={normalizeUser(activity.user)} />,
    activity_action: (
      <span className="text-sm font-semibold text-foreground">
        {activity.action || "—"}
      </span>
    ),
    description: (
      <p className="min-w-64 max-w-xl whitespace-normal text-sm text-muted-foreground">
        {activity.description || "—"}
      </p>
    ),
    createdAt: (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDateTime(activity.created_at)}
      </span>
    ),
  }));

  const totalItems = data?.meta?.count ?? activities.length;

  return (
    <ReusableTable
      title="Activity list"
      description={`${totalItems} activit${totalItems === 1 ? "y" : "ies"}`}
      data={rows}
      columns={[
        { header: "User", accessorKey: "user" },
        { header: "Action", accessorKey: "activity_action" },
        { header: "Description", accessorKey: "description" },
        { header: "Date & time", accessorKey: "createdAt" },
      ]}
      isLoading={isLoading || isFetching}
      totalItems={totalItems}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      emptyTitle={isError ? "Unable to load activity" : "No activity found"}
      emptyDescription={
        isError
          ? getApiErrorMessage(error, "Please try again later.")
          : "Team activity will appear here when actions are recorded."
      }
    />
  );
};

export default ActivityList;
