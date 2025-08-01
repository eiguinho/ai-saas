import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { PrivateRoute } from "./components/routes/PrivateRoute";
import { FlowGuardRoute } from "./components/routes/FlowGuardRoute";
import { SecurityGuardRoute } from "./components/routes/SecurityGuardRoute";

import Home from "./pages/home";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import EmailVerification from "./pages/auth/verify-email";
import VerifyCode from "./pages/auth/verify-code";
import TextGeneration from "./pages/generation/text-generation";
import ImageGeneration from "./pages/generation/image-generation";
import VideoGeneration from "./pages/generation/video-generation";
import Settings from "./pages/settings";
import Profile from "./pages/profile";
import Security from "./pages/profile/security";
import EditName from "./pages/profile/security/change-name";
import EditUsername from "./pages/profile/security/change-username";
import EditPassword from "./pages/profile/security/change-password";
import EditEmail from "./pages/profile/security/change-email";
import EditPhotoPanel from "./pages/profile/security/change-photo";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword  from "./pages/auth/forgot-password/reset-password";
import Projects  from "./pages/workspace/projects";
import EditProject from "./pages/workspace/projects/edit-project";
import ModifyContent from "./pages/workspace/projects/modify-content";
import GeneratedContentsList from "./pages/workspace/contents";

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
        path="/workspace/projects"
        element={
          <PrivateRoute>
            <Projects />
          </PrivateRoute>
        }
      />
      <Route
        path="/workspace/generated-contents"
        element={
          <PrivateRoute>
            <GeneratedContentsList />
          </PrivateRoute>
        }
      />
      <Route
        path="/workspace/projects/:id/edit"
        element={
          <PrivateRoute>
            <EditProject />
          </PrivateRoute>
        }
      />
      <Route
        path="/workspace/projects/:id/modify-content"
        element={
          <PrivateRoute>
            <ModifyContent />
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
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
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
      <Route
        path="/profile/security/name"
        element={
          <PrivateRoute>
            <SecurityGuardRoute allowedIf={true}>
              <EditName />
            </SecurityGuardRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/security/username"
        element={
          <PrivateRoute>
            <SecurityGuardRoute allowedIf={true}>
              <EditUsername />
            </SecurityGuardRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/security/password"
        element={
          <PrivateRoute>
            <SecurityGuardRoute allowedIf={true}>
              <EditPassword /> 
            </SecurityGuardRoute>
             
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/security/email"
        element={
          <PrivateRoute>
            <SecurityGuardRoute allowedIf={true}>
              <EditEmail />
            </SecurityGuardRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/security/photo"
        element={
          <PrivateRoute>
            <SecurityGuardRoute allowedIf={true}>
              <EditPhotoPanel />
            </SecurityGuardRoute>
          </PrivateRoute>
        }
      />
      <Route path="/login/forgot-password" element={<ForgotPassword />} />
      <Route path="/login/reset-password/:token" element={<ResetPassword />} />

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