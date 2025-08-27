import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import MainRoutes from "./routes";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600 text-sm">Carregando...</p>
      </div>
    );
  }

  return <MainRoutes />;
}

export default App;