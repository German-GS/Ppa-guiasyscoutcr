// src/components/MiPerfilCompleto/MiPerfilCompleto.js (Versión Final y Pulida)

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Navbar } from "../Navbar/Navbar"; // <-- IMPORTAMOS LA NAVBAR

export function MiPerfilCompleto() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPerfil(docSnap.data());
      } else {
        navigate("/completar-perfil");
      }
    };
    fetchProfile();
  }, [user, loading, navigate]);

  // Componente para mostrar hitos de progresión
  const DataItem = ({ label, value }) => (
    <div>
      <p className="text-sm font-bold text-gray-600">{label}</p>
      <p className="text-gray-800">{value || "No especificado"}</p>
    </div>
  );

  const EtapaHito = ({ etiqueta, completado, fecha }) => (
    <div
      className={`p-4 rounded-lg flex items-center justify-between ${
        completado
          ? "bg-green-100 border-green-200"
          : "bg-gray-100 border-gray-200"
      } border`}
    >
      <p className="font-semibold text-gray-800">{etiqueta}</p>
      {completado ? (
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle size={20} />
          <span className="font-bold">{fecha || "Completado"}</span>
        </div>
      ) : (
        <span className="text-gray-500 font-medium">Pendiente</span>
      )}
    </div>
  );

  if (!perfil) {
    return <div className="text-center p-10">Cargando perfil...</div>;
  }

  return (
    <div className="bg-fondo-claro min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-morado-principal">
              Mi Perfil
            </h1>
            {/* ▼▼▼ CONTENEDOR DE BOTONES ACTUALIZADO ▼▼▼ */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/home")} // Navega al inicio
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Volver
              </button>
              <Link
                to="/editar-perfil"
                className="btn-primary"
                style={{ width: "auto", padding: "0.75rem 1.5rem" }}
              >
                Editar Perfil
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-8">
            {/* ... (el resto del contenido del perfil se mantiene exactamente igual) ... */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b">
              <img
                src={user?.photoURL || "/img/avatar-default.png"}
                alt="Foto de perfil"
                className="w-24 h-24 rounded-full border object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 text-center sm:text-left">
                  {perfil.nombre} {perfil.apellido}
                </h2>
                <p className="text-gray-500 text-center sm:text-left">
                  {perfil.email}
                </p>
              </div>
            </div>
            <section>
              <h3 className="text-xl font-semibold text-scout-secondary mb-4">
                Información Personal y de Contacto
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DataItem label="Teléfono" value={perfil.telefono} />
                <DataItem label="Cédula o Pasaporte" value={perfil.cedula} />
                <DataItem label="Nacionalidad" value={perfil.nacionalidad} />
                <DataItem label="Provincia" value={perfil.provincia} />
                <DataItem label="Cantón" value={perfil.canton} />
                <DataItem label="Distrito" value={perfil.distrito} />
                <DataItem label="Grupo Scout" value={perfil.grupo} />
                <DataItem
                  label="Fecha de Ingreso"
                  value={perfil.fechaIngreso}
                />
                <DataItem
                  label="Fecha de Promesa"
                  value={perfil.fechaPromesa}
                />
              </div>
            </section>
            <section>
              <h3 className="text-xl font-semibold text-scout-secondary mb-4">
                Salud y Emergencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-gray-600">
                    Alergias, padecimientos o medicamentos
                  </p>
                  <p className="text-gray-800 mt-1 whitespace-pre-wrap">
                    {perfil.alergias || "No especificado"}
                  </p>
                </div>
                <div className="space-y-4">
                  <DataItem
                    label="Nombre Contacto de Emergencia"
                    value={perfil.emergencia?.nombre}
                  />
                  <DataItem
                    label="Teléfono de Emergencia"
                    value={perfil.emergencia?.telefono}
                  />
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-xl font-semibold text-scout-secondary mb-4">
                Mi Progresión
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EtapaHito
                  etiqueta="Etapa de Decisión"
                  completado={perfil.etapas?.decision}
                  fecha={perfil.etapas?.decisionFecha}
                />
                <EtapaHito
                  etiqueta="Ceremonia de Compromiso"
                  completado={perfil.etapas?.compromiso}
                  fecha={perfil.etapas?.compromisoFecha}
                />
                <EtapaHito
                  etiqueta="Insignia de Servicio"
                  completado={perfil.etapas?.insigniaServicio}
                  fecha={perfil.etapas?.insigniaFecha}
                />
                <EtapaHito
                  etiqueta="Confirmación"
                  completado={perfil.etapas?.confirmacion}
                  fecha={perfil.etapas?.confirmacionFecha}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-scout text-white text-center py-4 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-sm">
            Herramienta Digital de PPA · Desarrollado por German García Siles ·
            &copy; 2025 v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
