// src/components/CompletarPerfil.js
import React from "react";

export function CompletarPerfil() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white text-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-scout">Completa tu perfil</h1>
        <p className="text-gray-600">Parece que aún no has completado tus datos.</p>
        <p className="text-gray-600">Por favor ve a tu perfil para llenar la información requerida.</p>
      </div>
    </div>
  );
}
