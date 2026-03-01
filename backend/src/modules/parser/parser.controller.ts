import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Repository } from "../repo/repo.model.js";
import { scanCodeFiles } from "../indexer/fileScanner.js";
import { processRepositoryParsing } from "./parser.service.js";
import { CodeEntity } from "../codeEntity/codeEntity.model.js";

export async function parseRepoController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = req.params;

        // 🔍 Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid repository id",
            });
        }

        // 📦 Find repository
        const repo = await Repository.findById(id);

        if (!repo) {
            return res.status(404).json({
                success: false,
                message: "Repository not found",
            });
        }

        if (!repo.localPath) {
            return res.status(400).json({
                success: false,
                message: "Repository localPath not found",
            });
        }

        repo.status = "indexing";
        await repo.save();

        // 🧹 Remove previous parsed entities (avoid duplicates)
        await CodeEntity.deleteMany({ repoId: id });

        // 📂 Scan files (sync function)
        const scannedFiles = scanCodeFiles(repo.localPath);

        if (!scannedFiles.length) {

            repo.status = "failed";
            await repo.save();


            return res.status(200).json({
                success: true,
                message: "No scannable files found",
            });
        }

        // 🧠 Extract absolute paths for parser
        const filePaths = scannedFiles.map(file => file.absolutePath);

        // 🔬 Parse AST
        const result = await processRepositoryParsing(id, filePaths);

        // 🔄 Update repo status
        repo.status = "indexed";
        await repo.save();

        return res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {
        console.error("Parse Controller Error:", error);
        next(error);
    }
}