import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { useSelfDetailsQuery } from "@/features/auth/authApiSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { data, isSuccess, isLoading, refetch } = useSelfDetailsQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );

  const authChecked = !isAuthenticated || (isSuccess && data?.data);

  useEffect(() => {
    if (isAuthenticated && isSuccess && data?.data) {
      dispatch(userDetailsFetched(data.data));
    }
  }, [isSuccess, data, dispatch, isAuthenticated]);

  return {
    isLoading: isLoading || (isAuthenticated && !authChecked),
    authChecked,
    refetchProfile: refetch,
    user,
  };
};

export default useAuth;
