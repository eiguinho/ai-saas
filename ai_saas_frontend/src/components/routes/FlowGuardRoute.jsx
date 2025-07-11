import { Navigate, useLocation } from "react-router-dom";

export function FlowGuardRoute({ children, allowedIf }) {
  const location = useLocation();
  const emailFromState = location.state?.email;

  if (!allowedIf && !emailFromState) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}