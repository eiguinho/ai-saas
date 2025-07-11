import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function SecurityGuardRoute({ allowedIf, children }) {
  const { securityVerified } = useAuth();

  if (!allowedIf || !securityVerified) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
