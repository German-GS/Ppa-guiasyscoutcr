// src/components/ProtagonistaCard.js

import React from "react";

export function ProtagonistaCard({ protagonista }) {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 text-sm">
      <p className="font-bold text-gray-800">
        {protagonista.nombre} {protagonista.apellido}
      </p>
      <p className="text-gray-500">{protagonista.email}</p>
    </div>
  );
}
