import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import Home from './pages/home/index'
import { BrowserRouter } from 'react-router-dom';
import MainRoutes from "./routes";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MainRoutes></MainRoutes>
  </BrowserRouter>
  
  /*<StrictMode>
    <Home />
  </StrictMode>,*/
)
