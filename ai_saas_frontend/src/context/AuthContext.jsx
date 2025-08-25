import { createContext, useContext, useState, useEffect } from "react";
import { authRoutes, userRoutes } from "../services/apiRoutes";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);

  useEffect(() => {
  async function loadUser() {
    try {

      const res = await fetch(userRoutes.getCurrentUser(), {
        credentials: "include", // cookies
      });
      if (!res.ok) {
        throw new Error("Sessão inválida ou expirada");
      }

      const data = await res.json();

      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  loadUser();
}, []);


  function loginSuccess(authData) {
    setUser(authData.user);
  }

  function logout() {
    fetch(authRoutes.logout, {
      method: "POST",
      credentials: "include",
    }).then(() => {
    setUser(null);
    setSecurityVerified(false);
  });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginSuccess,
        logout,
        loading,
        securityVerified,
        setSecurityVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}