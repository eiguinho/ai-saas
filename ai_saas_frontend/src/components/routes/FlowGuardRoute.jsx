import { Navigate, useLocation } from "react-router-dom";

export function FlowGuardRoute({ children, allowedIf }) {
  const location = useLocation();

  if (!allowedIf) {
    return <Navigate to="/verify-email" replace state={{ from: location }} />;
  }

  return children;
}