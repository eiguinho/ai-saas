import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);

  useEffect(() => {
    fetch("/api/users/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar usuário");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function loginSuccess(authData) {
    setUser(authData.user);
  }

  function logout() {
    fetch("/api/users/logout", {
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
        setSecurityVerified, // NOVO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}