import { Routes, Route } from "react-router-dom";
import { Home } from "./components/Home.js";
import { Login } from "./components/Login.js";
import { Register } from "./components/Register.js";
import { ForgotPassword } from "./components/ForPassword.js";
import { AdminSeccion } from "./components/AdmiSeccion.js";
import { CompletarPerfil } from "./components/CompletarPerfil.js";
import { ProtectedRout } from "./components/ProtectedRoute.js";
import { AuthProvider } from "./context/authContext.js";

import "react-big-calendar/lib/css/react-big-calendar.css";

function App() {
  return (
    <div className="bg-primary min-h-screen text-white w-full">
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRout>
                <Home />
              </ProtectedRout>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRout>
                <AdminSeccion />
              </ProtectedRout>
            }
          />
          <Route
            path="/completar-perfil"
            element={
              <ProtectedRout>
                <CompletarPerfil />
              </ProtectedRout>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;

/* 
export function Home() {
  const {loading } = useAuth();
if (loading) return <h1>Loading</h1>;
  return (
    <div className="bg-white text-gray-400 w-full">
      <Navbar />
      <div className="max-w-screen-lg mx-auto">
        <h1 className="text-3xl mb-5 mt-5">PPA</h1>
        <hr/>
        
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <label className="text-xl block mb-2 text-sm font-medium text-gray-900 text-gray-400 mb-6">
              Sueños
            </label>
            <input
              type="text"
              className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
              placeholder="1"
            />
            <input
              type="text"
              className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
              placeholder="2"
            />
            <input
              type="text"
              className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
              placeholder="3"
            />
            <input
              type="text"
              className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
              placeholder="4"
            />
            <input
              type="text"
              className="text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
              placeholder="5"
            />
          </div>
       
         
          <div className="col-span-full">
          <button type="submit" class="max-w-200 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Registrar PPA</button>

          </div>
          
        </form>
      </div>
    

    </div>
    
  );
}

 */