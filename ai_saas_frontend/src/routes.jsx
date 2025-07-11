import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { PrivateRoute } from "./components/routes/PrivateRoute";
import { FlowGuardRoute } from "./components/routes/FlowGuardRoute";
import { SecurityGuardRoute } from "./components/routes/SecurityGuardRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/verify-email";
import VerifyCode from "./pages/verify-code";
import TextGeneration from "./pages/text-generation";
import ImageGeneration from "./pages/image-generation";
import VideoGeneration from "./pages/video-generation";
import Profile from "./pages/profile";
import Security from "./pages/profile/security";

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
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/security"
        element={
          <PrivateRoute>
            <SecurityGuardRoute allowedIf={true}>
              <Security />
            </SecurityGuardRoute>
          </PrivateRoute>
        }
      />

      {/* FLUXO DE CADASTRO */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route
        path="/verify-code"
        element={
          <FlowGuardRoute allowedIf={true}>
            <VerifyCode />
          </FlowGuardRoute>
        }
      />
      <Route
        path="/register"
        element={
          <FlowGuardRoute allowedIf>
            <Register />
          </FlowGuardRoute>
        }
      />
    </Routes>
  );
}

export default MainRoutes;