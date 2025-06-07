/// src/components/CompletarPerfil.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import comunidadIcon from "../img/COMUNIDAD-ICONO-1.png";
import { ImagGuiasyScout } from "./ImgGuiasyScout";

export function CompletarPerfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    grupo: "",
    provincia: "",
    canton: "",
    distrito: "",
    rol: "protagonista",
    email: "",
    fechaNacimiento: "",
    fechaIngreso: ""
  });

  useEffect(() => {
    const fullName = user?.displayName?.split(" ") || [];
    setForm((prev) => ({
      ...prev,
      nombre: fullName[0] || "",
      apellido: fullName.slice(1).join(" ") || "",
      email: user?.email || "",
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Guardar perfil en Firestore
      await setDoc(doc(db, "users", user.uid), {
        ...form,
        userId: user.uid,
      });

      // Redirigir según el rol
      if (form.rol === "consejero") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Error al guardar perfil:", err);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col items-center py-4 px-4">
      <ImagGuiasyScout className="w-20 mb-2" />
      <div className="bg-white text-gray-800 rounded shadow-md p-8 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-scout">Registro</h2>
          <img src={comunidadIcon} alt="Comunidad" className="w-10 h-10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm font-bold mb-1">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="bg-gris w-full p-2 rounded text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-bold mb-1">Apellido</label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="bg-gris w-full p-2 rounded text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-bold mb-1">Edad</label>
              <input
                type="number"
                name="edad"
                value={form.edad}
                onChange={handleChange}
                className="bg-gris w-full p-2 rounded text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-bold mb-1">Número de Grupo</label>
              <input
                name="grupo"
                value={form.grupo}
                onChange={handleChange}
                className="bg-gris w-full p-2 rounded text-gray-800"
                required
              />
            </div>
          </div>

          <hr className="my-2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-600 text-sm font-bold mb-1">Provincia</label>
              <input
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                className="bg-gris w-full p-2 rounded text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-bold mb-1">Cantón</label>
              <input
                name="canton"
                value={form.canton}
                onChange={handleChange}
                className="bg-gris w-full p-2 rounded text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-bold mb-1">Distrito</label>
              <input
                name="distrito"
                value={form.distrito}
                onChange={handleChange}
                className="bg-gris w-full p-2 rounded text-gray-800"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="bg-gris w-full p-2 rounded text-gray-800"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-1">Fecha de Ingreso al Movimiento</label>
            <input
              type="date"
              name="fechaIngreso"
              value={form.fechaIngreso}
              onChange={handleChange}
              className="bg-gris w-full p-2 rounded text-gray-800"
              required
            />
          </div>
        </div>


          <div className="mt-4">
            <label className="block text-gray-600 text-sm font-bold mb-1">Rol</label>
            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="bg-gris w-full p-2 rounded text-gray-800"
              required
            >
              <option value="protagonista">Protagonista</option>
              <option value="consejero">Consejero</option>
            </select>
          </div>

          <div className="flex justify-start">
            <button
              type="submit"
              className="bg-scout hover:bg-[#FFA400] text-white font-bold py-2 px-6 rounded"
            >
              Guardar Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
