
import { CodeEntity } from "../models/codeEntity.model.js";
import { searchVectors } from "./vector.service.js";
import { buildPrompt } from "./prompt.service.js";
import { generateAnswer } from "./llm.service.js";
import { embedText } from "./embedding.service.js";

export const runRAGPipeline = async (repoId: string, question: string) => {

  // 1️⃣ Question embedding
  const queryEmbedding = await embedText(question);

  // 2️⃣ Vector search
  const entityIds = await searchVectors(queryEmbedding);

  // 3️⃣ Fetch entities
  const entities = await CodeEntity.find({
    _id: { $in: entityIds },
    repoId
  });

  // 4️⃣ Prompt
  const prompt = buildPrompt(question, entities);

  // 5️⃣ Gemini
  const answer = await generateAnswer(prompt);

  // 6️⃣ Structured response
  return {
    answer,
    sources: entities.map(e => ({
      filePath: e.filePath,
      startLine: e.startLine,
      endLine: e.endLine
    }))
  };
};