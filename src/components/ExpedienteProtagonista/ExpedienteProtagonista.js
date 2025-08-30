// en: src/components/ExpedienteProtagonista/ExpedienteProtagonista.js (Versión Final Corregida)

import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../../firebase";
import { BitacoraDetalle } from "../Bitacora/BitacoraDetalle";
import { ArrowLeft } from "lucide-react";
import Modal from "react-modal";
import { GraficosProtagonista } from "../GraficosProtagonista/GraficosProtagonista";

export function ExpedienteProtagonista({ protagonista, onVolver }) {
  const [formData, setFormData] = useState({});
  const [datosPerfil, setDatosPerfil] = useState(null);
  const [rolEditado, setRolEditado] = useState("");
  const [bitacoraList, setBitacoraList] = useState([]);
  const [latestEntryData, setLatestEntryData] = useState(null);
  const [selectedBitacora, setSelectedBitacora] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (protagonista?.uid) {
        // ... (Tu lógica para cargar datos se mantiene igual)
      }
    };
    cargarDatos();
  }, [protagonista]);

  // ... (Tus otras funciones se mantienen igual)

  if (!protagonista || !datosPerfil) {
    return <div className="text-gray-800 text-center p-10">Cargando...</div>;
  }

  return (
    <>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-gray-800">
        {/* ... (El JSX de la ficha de perfil se mantiene igual) ... */}
      </div>

      <GraficosProtagonista
        ppaList={bitacoraList}
        evaluacionData={latestEntryData?.bitacoraExplorador}
      />

      <div className="max-w-4xl mx-auto mt-10">
        <h3 className="text-xl font-bold text-principal mb-4">
          Bitácoras registradas por el protagonista
        </h3>
        {/* ... (El JSX de la lista de bitácoras se mantiene igual) ... */}
      </div>

      <Modal
        isOpen={!!selectedBitacora}
        onRequestClose={() => setSelectedBitacora(null)}
        contentLabel="Detalles de la Bitácora"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70"
      >
        {selectedBitacora && (
          <BitacoraDetalle
            selectedPpa={selectedBitacora}
            closeModal={() => setSelectedBitacora(null)}
            mostrarBotonEditar={false}
          />
        )}
      </Modal>
    </>
  );
}
