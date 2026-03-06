import { Router } from "express";
import { addRepository, deleteRepository, getRepositoryById, getUserRepositories, scanRepository } from "./repo.controller.js";
import { protect } from "../auth/auth.middleware.js";
import { parseRepoController } from "../parser/parser.controller.js";
import { getRepositoryEntities } from "../codeEntity/codeEntity.controller.js";
import { getRepositoryoRelations}from "../codeRelations/relationship.controller.js"
import { getRepoFilesController } from "../fileMetadata/fileMetadata.controller.js";

const router = Router();

router.post("/", protect, addRepository)
router.get("/", protect, getUserRepositories)
router.get("/:id", protect, getRepositoryById)
router.delete("/:id", protect, deleteRepository)
router.get("/:id/scan", protect, scanRepository);
router.post("/:id/parse", protect, parseRepoController);
router.get("/:id/entities", protect, getRepositoryEntities);
router.get("/:id/relations", protect, getRepositoryoRelations)
router.get("/:id/files", getRepoFilesController);

export default router;