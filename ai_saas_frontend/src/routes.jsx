import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { PrivateRoute } from "./components/routes/PrivateRoute";
import { FlowGuardRoute } from "./components/routes/FlowGuardRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/verify-email";
import VerifyCode from "./pages/verify-code";
import TextGeneration from "./pages/text-generation";
import ImageGeneration from "./pages/image-generation";
import VideoGeneration from "./pages/video-generation";

function MainRoutes(){
  const { user, loading } = useAuth();

  if (loading) return null; // Ou um spinner aqui

  return (
    <Routes>
      {/* ROTAS PRIVADAS */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/text-generation"
        element={
          <PrivateRoute>
            <TextGeneration />
          </PrivateRoute>
        }
      />
      <Route
        path="/image-generation"
        element={
          <PrivateRoute>
            <ImageGeneration />
          </PrivateRoute>
        }
      />
      <Route
        path="/video-generation"
        element={
          <PrivateRoute>
            <VideoGeneration />
          </PrivateRoute>
        }
      />

      {/* FLUXO DE CADASTRO */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route
        path="/verify-code"
        element={
          <FlowGuardRoute allowedIf={window.history.state?.usr?.email}>
            <VerifyCode />
          </FlowGuardRoute>
        }
      />
      <Route
        path="/register"
        element={
          <FlowGuardRoute allowedIf={window.history.state?.usr?.email}>
            <Register />
          </FlowGuardRoute>
        }
      />
    </Routes>
  );
}

export default MainRoutes;