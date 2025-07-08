import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import Home from './pages/home/index'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainRoutes from "./routes";
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
        <MainRoutes></MainRoutes>
        <ToastContainer theme="colored" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
