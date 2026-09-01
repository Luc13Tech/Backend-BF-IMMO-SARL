const mongoose = require('mongoose');

/**
 * Base de connaissance éditable pour l'Assistant Virtuel BF IMMO.
 * Chaque entrée est un bloc d'information que l'IA peut utiliser
 * pour répondre (pas un script figé de questions/réponses).
 */
const aiKnowledgeSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true }, // ex: "Processus de visite", "Zones couvertes"
    content: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIKnowledge', aiKnowledgeSchema);
