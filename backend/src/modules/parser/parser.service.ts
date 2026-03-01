import { CodeEntity } from "../codeEntity/codeEntity.model.js";
import { parseRepository } from "./astParser.js";

export async function processRepositoryParsing(repoId: string, filePath: string[]) {
    const ParsedEntities = await parseRepository(repoId, filePath);

    if (!ParsedEntities.length) return { message: "No Entities found" }

    await CodeEntity.insertMany(ParsedEntities);

    return {
        message: "Parsing completed",
        totalEntities: ParsedEntities.length,
    }
}