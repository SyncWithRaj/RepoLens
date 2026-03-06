import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { Repository } from "../repo/repo.model.js";
import { scanCodeFiles } from "../indexer/fileScanner.js";
import { processRepositoryParsing } from "./parser.service.js";

import { CodeEntity } from "../codeEntity/codeEntity.model.js";
import { CodeRelationship } from "../codeRelations/relationship.model.js";
import { FileMetadata } from "../fileMetadata/fileMetadata.model.js";


export async function parseRepoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid repository id"
      });
    }

    const repo = await Repository.findById(id);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found"
      });
    }

    if (!repo.localPath) {
      return res.status(400).json({
        success: false,
        message: "Repository localPath not found"
      });
    }


    // indexing start
    repo.status = "indexing";
    await repo.save();


    // 🔥 clean old indexed data
    await CodeEntity.deleteMany({ repoId: id });
    await CodeRelationship.deleteMany({ repoId: id });
    await FileMetadata.deleteMany({ repoId: id });


    // scan files
    const scannedFiles = scanCodeFiles(repo.localPath);

    if (!scannedFiles.length) {

      repo.status = "failed";
      await repo.save();

      return res.status(200).json({
        success: true,
        message: "No scannable files found"
      });
    }


    const filePaths = scannedFiles.map(file => file.absolutePath);


    // 🔥 run parsing pipeline
    const result = await processRepositoryParsing(id, filePaths);


    // indexing complete
    repo.status = "indexed";
    await repo.save();


    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {

    console.error("Parse Controller Error:", error);

    next(error);
  }
}