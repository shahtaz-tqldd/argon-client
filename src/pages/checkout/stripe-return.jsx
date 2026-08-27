import { Navigate, useSearchParams } from "react-router-dom";

import { getStripeReturnPath } from "@/lib/stripe";

const StripeReturnPage = ({ status }) => {
  const [searchParams] = useSearchParams();
  const returnPath = getStripeReturnPath();

  if (!status) {
    return <Navigate to={returnPath} replace />;
  }

  const nextParams = new URLSearchParams({ checkout: status });
  const sessionId = searchParams.get("session_id");
  if (sessionId) nextParams.set("session_id", sessionId);

  return (
    <Navigate
      to={returnPath + "?" + nextParams.toString()}
      replace
    />
  );
};

export default StripeReturnPage;
