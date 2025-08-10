// src/components/EditarPerfil/EditarPerfil.js (Versión Pulida)

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
// ▼▼▼ 1. IMPORTAMOS LA NAVBAR Y EL ICONO ▼▼▼
import { Navbar } from "../Navbar/Navbar";
import comunidadIcon from "../../img/COMUNIDAD-ICONO-1.png";

export function EditarPerfil() {
  const { user, loading } = useAuth();
  const navigate = useNavigate(); // Hook para la navegación
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      } else {
        navigate("/completar-perfil");
      }
    };
    fetchProfile();
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("emergencia")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencia: { ...prev.emergencia, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, formData);
      Swal.fire("¡Éxito!", "Tu perfil ha sido actualizado.", "success");
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      Swal.fire("Error", "No se pudo actualizar tu perfil.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) {
    return <div className="text-center p-10">Cargando perfil...</div>;
  }

  return (
    // ▼▼▼ 2. ENVOLVEMOS TODO Y AÑADIMOS LA NAVBAR ▼▼▼
    <div className="bg-fondo-claro min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* --- 3. CABECERA CON TÍTULO, ICONO Y BOTÓN VOLVER --- */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={comunidadIcon}
                  alt="Comunidad"
                  className="w-12 h-12"
                />
                <h1 className="text-3xl font-bold text-morado-principal">
                  Editar Mi Perfil
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)} // Vuelve a la página anterior
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Volver
              </button>
            </div>

            {/* --- Sección de Información Personal --- */}
            <section>
              <h2 className="text-xl font-semibold text-scout-secondary mb-4 border-b pb-2">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Nombre
                  </label>
                  <p className="mt-1 text-lg text-gray-800">
                    {formData.nombre}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Apellido
                  </label>
                  <p className="mt-1 text-lg text-gray-800">
                    {formData.apellido}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">
                    Correo Electrónico
                  </label>
                  <p className="mt-1 text-lg text-gray-800 break-words">
                    {formData.email}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    id="telefono"
                    value={formData.telefono || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cedula"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Cédula o Pasaporte
                  </label>
                  <input
                    type="text"
                    name="cedula"
                    id="cedula"
                    value={formData.cedula || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="nacionalidad"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Nacionalidad
                  </label>
                  <input
                    type="text"
                    name="nacionalidad"
                    id="nacionalidad"
                    value={formData.nacionalidad || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="provincia"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Provincia
                  </label>
                  <input
                    type="text"
                    name="provincia"
                    id="provincia"
                    value={formData.provincia || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="canton"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Cantón
                  </label>
                  <input
                    type="text"
                    name="canton"
                    id="canton"
                    value={formData.canton || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="distrito"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Distrito
                  </label>
                  <input
                    type="text"
                    name="distrito"
                    id="distrito"
                    value={formData.distrito || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
              </div>
            </section>

            {/* --- Sección Guía y Scout --- */}
            <section>
              <h2 className="text-xl font-semibold text-scout-secondary mb-4 border-b pb-2">
                Información Guía y Scout
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="grupo"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Grupo Scout
                  </label>
                  <input
                    type="text"
                    name="grupo"
                    id="grupo"
                    value={formData.grupo || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fechaIngreso"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Fecha de Ingreso
                  </label>
                  <input
                    type="date"
                    name="fechaIngreso"
                    id="fechaIngreso"
                    value={formData.fechaIngreso || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fechaPromesa"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Fecha de Promesa
                  </label>
                  <input
                    type="date"
                    name="fechaPromesa"
                    id="fechaPromesa"
                    value={formData.fechaPromesa || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  />
                </div>
              </div>
            </section>

            {/* --- Sección de Salud y Emergencia --- */}
            <section>
              <h2 className="text-xl font-semibold text-scout-secondary mb-4 border-b pb-2">
                Salud y Emergencia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="alergias"
                    className="block text-sm font-bold text-gray-700"
                  >
                    Alergias, padecimientos o medicamentos
                  </label>
                  <textarea
                    name="alergias"
                    id="alergias"
                    rows="4"
                    value={formData.alergias || ""}
                    onChange={handleChange}
                    className="border-input mt-1"
                  ></textarea>
                </div>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="emergencia.nombre"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Nombre Contacto de Emergencia
                    </label>
                    <input
                      type="text"
                      name="emergencia.nombre"
                      id="emergencia.nombre"
                      value={formData.emergencia?.nombre || ""}
                      onChange={handleChange}
                      className="border-input mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="emergencia.telefono"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Teléfono de Emergencia
                    </label>
                    <input
                      type="tel"
                      name="emergencia.telefono"
                      id="emergencia.telefono"
                      value={formData.emergencia?.telefono || ""}
                      onChange={handleChange}
                      className="border-input mt-1"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* --- 4. BOTÓN DE GUARDAR CON ESTILO GLOBAL --- */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "auto", padding: "0.75rem 1.5rem" }}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Actualizar Perfil"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
