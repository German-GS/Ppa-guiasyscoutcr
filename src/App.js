import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home.js";
import { Login } from "./components/Login.js";
import { Register } from "./components/Register.js";
import { ForgotPassword } from "./components/ForPassword.js";
import { AuthProvider } from "./context/authContext.js";
import { ProtectedRout } from "./components/ProtectedRoute.js";
import { AdminSeccion } from "./components/AdmiSeccion.js";
import { CompletarPerfil } from "./components/CompletarPerfil.js";
import { FlujoLogin } from "./components/FlujoLogin.js"; // Asegúrate de tener este componente

import "react-big-calendar/lib/css/react-big-calendar.css";

function App() {
  return (
    <div className="bg-primary min-h-screen text-white w-full">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<FlujoLogin />} /> {/* ← nuevo punto de entrada */}
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
