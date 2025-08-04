// Añade esto en functions/index.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { VertexAI } = require("@google-cloud/vertexai");

function projectId() {
  return process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
}

exports.vertexDiag = onCall({ region: "us-central1" }, async () => {
  const project = projectId();
  if (!project) {
    throw new HttpsError("failed-precondition", "No hay PROJECT en runtime.");
  }

  const REGIONS = ["us-central1", "us-east1"]; // probamos 2 regiones comunes
  const MODELS = [
    "gemini-1.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite-001",
    "gemini-embedding-001",
    "gemini-1.0-pro",
    "gemini-1.0-pro-001",
    "gemini-pro",
  ];
  const functions = require("firebase-functions");

  const results = [];

  for (const loc of REGIONS) {
    for (const modelName of MODELS) {
      const vertex = new VertexAI({ project, location: loc });
      const gen = vertex.getGenerativeModel({ model: modelName });
      try {
        await gen.generateContent({
          contents: [{ role: "user", parts: [{ text: "ping" }] }],
        });
        results.push({ location: loc, model: modelName, ok: true });
      } catch (e) {
        results.push({
          location: loc,
          model: modelName,
          ok: false,
          message: e?.message,
        });
      }
    }
  }

  return { project, results };
});

// La función principal para la app (esta es la que falta)
exports.suggestSubtasks = onCall({ region: "us-central1" }, async (request) => {
  // 1. Autenticación y validación de entrada
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes estar autenticado.");
  }
  const objective = request.data.objective;
  if (
    !objective ||
    typeof objective !== "string" ||
    objective.trim().length < 10
  ) {
    throw new HttpsError(
      "invalid-argument",
      "El objetivo debe ser un texto de al menos 10 caracteres."
    );
  }

  try {
    // 2. Inicializar Vertex AI
    const project = projectId(); // Usamos la función que ya tienes
    const location = "us-central1";
    const vertexAI = new VertexAI({ project, location });

    // 3. Seleccionar el modelo
    const model = "gemini-2.5-flash";
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      systemInstruction:
        'Eres un asistente para scouts. Tu tarea es dividir un objetivo principal en 3 o 4 subtareas claras y accionables. Responde únicamente con un objeto JSON que contenga una clave \'subtasks\', que es un arreglo de strings. Ejemplo: { "subtasks": ["Subtarea 1", "Subtarea 2"] }',
    });

    // 4. Crear el prompt
    const prompt = `Divide el siguiente objetivo en subtareas: "${objective}"`;

    // 5. Llamar a la API de IA
    const resp = await generativeModel.generateContent(prompt);
    const content = resp.response.candidates[0].content;

    // 6. Procesar y devolver la respuesta
    // 6. Procesar y devolver la respuesta
    let rawText = content.parts[0].text;

    // Buscamos si la respuesta viene en un bloque Markdown y extraemos el JSON
    const match = rawText.match(/```json\n([\s\S]*?)\n```/);
    if (match) {
      rawText = match[1];
    }

    const jsonResponse = JSON.parse(rawText);

    if (!jsonResponse.subtasks || !Array.isArray(jsonResponse.subtasks)) {
      throw new Error(
        "La respuesta de la IA no tuvo el formato JSON esperado."
      );
    }

    return { subtasks: jsonResponse.subtasks };
  } catch (error) {
    console.error("Error al generar subtareas:", error);
    throw new HttpsError(
      "internal",
      "No se pudieron generar las sugerencias.",
      error.message
    );
  }
});
