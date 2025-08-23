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
        'Eres un consejero Guía y Scout experto, especializado en la planificación de proyectos de servicio comunitario. Un joven Rover te presentará su meta o proyecto. Tu misión es generar una lista de 3 a 7 pasos de preparación, logística y contacto que reflejen el espíritu de servicio y sean necesarios ANTES de ejecutar el proyecto. Siempre que sea apropiado, incluye una tarea sobre contactar a una institución gubernamental o comunal relevante para solicitar apoyo o permisos. Si la meta menciona una localidad específica (un pueblo, un parque, un barrio), úsala para hacer la sugerencia de contacto más precisa. No incluyas la meta final en la lista de pasos. Por ejemplo, si la meta es "Recoger basura en el parque de Tibás", una respuesta excelente sería: ["Contactar a la Municipalidad de Tibás para coordinar y solicitar permisos", "Diseñar una campaña en redes sociales para invitar a vecinos de la comunidad", "Buscar el apoyo de empresas locales de reciclaje o gestión de residuos"]. Responde únicamente con un objeto JSON que contenga la clave \'subtasks\' con un arreglo de strings.',
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

// functions/index.js (añade esto)

const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");

try {
  admin.initializeApp();
} catch (_) {}
const db = admin.firestore();

/**
 * Cierra todas las votaciones vencidas (<= ahora).
 * No cierra por mayoría: SOLO por tiempo.
 */
exports.closeExpiredVotaciones = onSchedule(
  { schedule: "every 1 minutes", region: "us-central1" },
  async () => {
    const now = admin.firestore.Timestamp.now();

    // ciclos en votación cuyo cierraEn ya pasó
    const qs = await db
      .collection("ciclos")
      .where("estado", "==", "en_votacion")
      .where("votacion.cierraEn", "<=", now)
      .get();

    if (qs.empty) return null;

    for (const docSnap of qs.docs) {
      const cicloRef = docSnap.ref;
      const ciclo = docSnap.data();
      const requeridos = ciclo?.votacion?.requeridos || 1;

      // Contar votos al cierre (simple)
      const votosSnap = await cicloRef.collection("votos").get();
      let aFavor = 0;
      votosSnap.forEach((v) => {
        if (v.data()?.valor === true) aFavor++;
      });
      const enContra = votosSnap.size - aFavor;

      const aprobado = aFavor >= requeridos;

      await cicloRef.update({
        estado: aprobado ? "activo" : "rechazado",
        visible: aprobado, // si aprobó, todos lo ven
        "votacion.estado": "cerrada",
        "votacion.aFavor": aFavor,
        "votacion.enContra": enContra,
        "votacion.cerradoEn": admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  }
);
