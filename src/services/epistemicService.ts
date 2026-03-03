import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface EpistemicScore {
  thinker: string;
  score: number; // 0-100
  reasoning: string; // Why this score?
  critique: string;
  quote: string;
}

export interface AnalysisResult {
  coreAssumptions: string[];
  researchQuestion: string;
  scores: EpistemicScore[];
  cohesionScore: number; // 0-100, indicates paradigmatic focus (high) vs pluralism (low)
  recommendation: string;
  provocation: string; // A challenge from the opposing perspective
}

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash"; // Using a fast model for responsiveness

  const prompt = `
    Analyze the following text which represents a user's inquiry or set of assumptions.
    
    Text: "${text}"
    
    Tasks:
    1. Extract the core underlying assumptions (max 3).
    2. Formulate the primary research question implied by the text.
    3. Evaluate this inquiry against 13 major epistemic frameworks representing a broad spectrum of human thought:
       
       -- CLASSICAL & FOUNDATIONAL --
       1. Empiricism (Hume): Inductive Naturalism, Skepticism. "Knowledge comes from experience."
       2. Transcendental (Kant): Conditions of possibility, Critical Idealism. "What makes experience possible?"
       3. Falsificationism (Popper): Deduction, Critical Rationalism. "Can it be proven wrong? If not, it's not science."
       4. Pragmatism (Dewey/James): Truth is what works/utility. "What are the practical consequences?"
       5. Abduction (Peirce): Inference to the best explanation. "What is the most likely cause?"
       
       -- STRUCTURAL & HISTORICAL --
       6. Research Programmes (Lakatos): Structured theoretical evolution. "Is the theory progressive?"
       7. Interpretive/Paradigmatic (Kuhn): Situated, contextual consensus. "What is the paradigm?"
       8. Post-Structuralism (Foucault): Power/Knowledge, discourse analysis. "Who benefits from this truth?"
       
       -- CRITICAL & SITUATED --
       9. Feminist/Standpoint (Harding/Haraway): Situated knowledges. "How does the social position of the knower affect the known?"
       10. Indigenous/Relational (Kimmerer/Watson): Relational web, participation vs extraction. "What is my relationship to this knowledge?"
       11. Phenomenology (Husserl/Heidegger): Lived experience, consciousness. "What is the texture of the experience?"
       
       -- CONTEMPORARY & COMPLEXITY --
       12. Bayesianism (Pearl/Jaynes): Probabilistic inference, causal modeling. "How does evidence update credence?"
       13. Critical Realism (Bhaskar): Stratified ontology, mechanisms. "What underlying mechanisms generate events?"
       14. Complex Systems (Prigogine/Stengers): Emergence, non-linearity. "How does order emerge from chaos?"
       15. Metascience (Ioannidis/Nosek): Replication, robustness. "Is this result reproducible?"
    
    4. For each framework, assign a relevance score (0-100).
    5. For each framework, provide a short, specific critique or question.
    6. Determine a "cohesion score" (0-100). NOTE: High score = focused on one paradigm. Low score = pluralistic/multidisciplinary.
    7. Provide a recommendation on how to advance the question.
    8. Provide a "Provocation": Identify the framework with the LOWEST alignment or the one that offers the most radical critique, and write a challenging question from that perspective to shake the user's assumptions.

    Return the result as JSON.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coreAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          researchQuestion: { type: Type.STRING },
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                thinker: { type: Type.STRING },
                score: { type: Type.NUMBER },
                critique: { type: Type.STRING },
                quote: { type: Type.STRING },
              },
              required: ["thinker", "score", "critique", "quote"],
            },
          },
          cohesionScore: { type: Type.NUMBER },
          recommendation: { type: Type.STRING },
          provocation: { type: Type.STRING },
        },
        required: ["coreAssumptions", "researchQuestion", "scores", "cohesionScore", "recommendation", "provocation"],
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as AnalysisResult;
  }
  
  throw new Error("Failed to analyze text");
};
