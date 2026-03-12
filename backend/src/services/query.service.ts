import { CodeEntity } from "../models/codeEntity.model.js";
import { searchVectors } from "./vector.service.js";

export const askQuestion = async (repoId: string, question: string) => {

  const results = await searchVectors(repoId, question);

  console.log("VECTOR RESULTS:", results);

  const entityIds = results.map((r: any) => r[0].metadata.mongoId);

  const entities = await CodeEntity.find({
    _id: { $in: entityIds }
  });

  return entities.map((entity: any, index: number) => ({
    filePath: entity.filePath,
    code: entity.content,
    startLine: entity.startLine,
    endLine: entity.endLine,
    score: results[index][1]
  }));
};