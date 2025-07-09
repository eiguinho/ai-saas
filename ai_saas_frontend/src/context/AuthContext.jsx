import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar usuário");
        return res.json();
      })
      .then((data) => {
        console.log("Usuário carregado do backend:", data);
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
    }).then(() => setUser(null));
  }

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}