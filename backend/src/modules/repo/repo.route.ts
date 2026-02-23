import { Router } from "express";
import { addRepository, deleteRepository, getRepositoryById, getUserRepositories, scanRepository } from "./repo.controller.js";
import { protect } from "../auth/auth.middleware.js";

const router = Router();

router.post("/", protect, addRepository)
router.get("/", protect, getUserRepositories)
router.get("/:id", protect, getRepositoryById)
router.delete("/:id", protect, deleteRepository)
router.get("/:id/scan", protect, scanRepository);

export default router;