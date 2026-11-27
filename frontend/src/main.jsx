import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles/base.css";
import "./styles/store.css";
import "./styles/admin.css";
import StoreApp from "./store/StoreApp.jsx";
import AdminApp from "./admin/AdminApp.jsx";

// Two apps in one site: the shop at "/" and the admin panel at "/admin".
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<StoreApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
