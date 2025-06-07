import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/authContext";
import Swal from "sweetalert2";

export function Asistencia() {
  const { user } = useAuth();
  const [protagonistas, setProtagonistas] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [asistencias, setAsistencias] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarProtagonistas = async () => {
      if (!user) return;

      setCargando(true);
      console.log("Cargando protagonistas para el consejero:", user.uid);

      try {
        // Cargar protagonistas desde la subcolección del consejero
        const protagonistasRef = collection(db, `consejeros/${user.uid}/protagonistas`);
        const querySnapshot = await getDocs(protagonistasRef);
        
        const protagonistasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log("Protagonistas cargados:", protagonistasData);
        setProtagonistas(protagonistasData);

        // Inicializar estado de asistencias
        const estadoInicial = {};
        protagonistasData.forEach(prota => {
          estadoInicial[prota.id] = false;
        });
        setAsistencias(estadoInicial);

      } catch (error) {
        console.error("Error al cargar protagonistas:", error);
        Swal.fire("Error", "No se pudieron cargar los protagonistas", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarProtagonistas();
  }, [user]);

  const handleAsistenciaChange = (protagonistaId) => {
    setAsistencias(prev => ({
      ...prev,
      [protagonistaId]: !prev[protagonistaId]
    }));
  };

  const guardarAsistencia = async () => {
    try {
      // Guardar en /asistencias/{fecha}
      const asistenciaRef = doc(db, `consejeros/${user.uid}/asistencias/${fecha}`);
      await setDoc(asistenciaRef, {
        fecha,
        consejeroId: user.uid,
        consejeroEmail: user.email,
        registros: asistencias,
        timestamp: new Date()
      });

      Swal.fire({
        title: "¡Éxito!",
        text: "Asistencia guardada correctamente",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      console.error("Error al guardar asistencia:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar la asistencia",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  if (!user) {
    return <div className="text-gray-600 p-4">Cargando datos de usuario...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-scout-secondary">Control de Asistencia</h2>
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-gray-700 mb-2 font-medium">Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="text-gray-800 border border-gray-300 rounded px-3 py-2 w-full md:w-auto focus:ring-scout focus:border-scout"
        />

      </div>

      {cargando ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-scout mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando lista de protagonistas...</p>
        </div>
      ) : protagonistas.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600">No hay protagonistas asignados.</p>
          <p className="text-gray-500 mt-2">Agrega protagonistas desde el menú principal.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 space-y-3">
            {protagonistas.map(prota => (
              <div 
                key={prota.id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{prota.nombre} {prota.apellido}</p>
                  <p className="text-sm text-gray-500">Grupo: {prota.grupo}</p>
                </div>
                <input
                  type="checkbox"
                  checked={asistencias[prota.id] || false}
                  onChange={() => handleAsistenciaChange(prota.id)}
                  className="h-5 w-5 text-scout focus:ring-scout border-gray-300 rounded"
                />
              </div>
            ))}
          </div>

          <button
            onClick={guardarAsistencia}
            disabled={cargando || protagonistas.length === 0}
            className={`px-6 py-2 rounded font-medium ${
              cargando || protagonistas.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-scout text-white hover:bg-yellow-600"
            } transition-colors`}
          >
            {cargando ? "Guardando..." : "Guardar Asistencia"}
          </button>
        </>
      )}
    </div>
  );
}