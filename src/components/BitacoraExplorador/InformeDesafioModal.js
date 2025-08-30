// en: src/components/BitacoraExplorador/InformeDesafioModal.js

import React, { useState } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";

export const InformeDesafioModal = ({ isOpen, onClose, desafio, onSave }) => {
  const [titulo, setTitulo] = useState("");
  const [notas, setNotas] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    // La función onSave se encargará de subir el archivo y guardar los datos
    await onSave({
      desafioId: desafio.nivel, // Usamos el nivel como ID único por ahora
      titulo,
      notas,
      archivo,
    });
    setIsSaving(false);
    onClose(); // Cierra el modal después de guardar
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Informe de Desafío"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-70"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-principal mb-2">
          Informe de Desafío
        </h2>
        <p
          className={`font-bold mb-4 text-sm ${
            desafio.nivel.toLowerCase() === "bronce"
              ? "text-yellow-600"
              : desafio.nivel.toLowerCase() === "plata"
              ? "text-gray-500"
              : "text-yellow-400"
          }`}
        >
          {desafio.nivel}: {desafio.titulo}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-texto-principal mb-1">
              Título de tu Aventura
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="border-input w-full"
              placeholder="Ej: Taller de Primeros Auxilios para Lobatos"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-texto-principal mb-1">
              Bitácora de la Misión (Notas)
            </label>
            <textarea
              rows="5"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="border-input w-full"
              placeholder="Describe qué hiciste, qué aprendiste y cómo te sentiste..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-texto-principal mb-1">
              Evidencia Fotográfica
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-texto-secundario file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fondo file:text-principal hover:file:bg-principal-oscuro hover:file:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{ width: "auto" }}
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar Informe"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
