import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home/Home.js";
import { Login } from "./components/Login/Login.js";
import { Register } from "./components/Register/Register.js";
import { ForgotPassword } from "./components/ForPassword.js";
import { AuthProvider } from "./context/authContext.js";
import { ProtectedRout } from "./components/ProtectedRoute.js";
import { AdminSeccion } from "./components/AdmiSeccion/AdmiSeccion";
import { CompletarPerfil } from "./components/CompletarPerfil.js";
import { FlujoLogin } from "./components/FlujoLogin.js";

import "react-big-calendar/lib/css/react-big-calendar.css";

function App() {
  return (
    // ▼▼▼ LÍNEA CORREGIDA ▼▼▼
    <div className="min-h-screen w-full">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<FlujoLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/completar-perfil" element={<CompletarPerfil />} />
          <Route
            path="/admin"
            element={
              <ProtectedRout>
                <AdminSeccion />
              </ProtectedRout>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRout>
                <Home />
              </ProtectedRout>
            }
          />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
