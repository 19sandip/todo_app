import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./homePage/js/HomePage.js";
import Login from "./authPages/Login.js";
import Signup from "./authPages/Signup.js";
import { AuthProvider } from "./authentication/Authentication.js";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
