import type { Request, Response } from "express";
import simpleGit from "simple-git";
import { Repository } from "../models/repo.model.js";
import fs from "fs"
import path from "path";
import { scanCodeFiles } from "../modules/indexer/fileScanner.js";


const git = simpleGit();

export const addRepository = async (req: Request, res: Response) => {
    try {
        const { githubUrl } = req.body;
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        if (!githubUrl) {
            return res.status(400).json({ message: "GitHub URL is required" });
        }

        if (!githubUrl.startsWith("https://github.com/")) {
            return res.status(400).json({
                message: "Invalid GitHub repository URL",
            });
        }

        const repoName = githubUrl.split("/").pop()?.replace(".git", "");

        if (!repoName) {
            return res.status(400).json({ message: "Invalid GitHub URL" });
        }

        const repo = new Repository({
            user: user._id,
            name: repoName,
            githubUrl,
            status: "cloning",
        });

        // create storage path
        const repoPath = path.join(
            process.cwd(),
            "storage",
            "repos",
            user._id.toString(),
            repo._id.toString()
        );

        fs.mkdirSync(repoPath, { recursive: true });

        //update localPath
        repo.localPath = repoPath;
        await repo.save();

        // clone repo
        try {
            await git.clone(githubUrl, repoPath);

            repo.status = "cloned";
            await repo.save();
        } catch (cloneError) {
            repo.status = "failed";
            await repo.save();

            // Clean up failed folder
            if (fs.existsSync(repoPath)) {
                fs.rmSync(repoPath, { recursive: true, force: true });
            }

            return res.status(500).json({
                success: false,
                message: "Repository cloning failed",
            });
        }
        return res.status(201).json({
            success: true,
            repo,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Repository cloning failed"
        });
    }
};

export const getUserRepositories = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const repos = await Repository.find({ user: user._id }).select("-__v");

        res.json({
            success: true,
            repos,
        });
    } catch (error) {
        res.status(500).json({ message: "Failes to fetch repositories" })
    }
};

export const getRepositoryById = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Not authorized" });
        }


        const repo = await Repository.findOne({
            _id: req.params.id,
            user: user._id,
        }).select("-__v");

        if (!repo) {
            return res.status(404).json({ message: "Repo not found" });
        }

        res.json({
            success: true,
            repo,
        })
    } catch (error) {
        res.status(500).json({ message: "Failes to fetch repositories" })
    }
}

export const deleteRepository = async (req: Request, res: Response) => {
    try {
        const repo = await Repository.findById(req.params.id);

        if (!repo) {
            return res.status(404).json({ message: "Repo not found" })
        }

        /// Delete folder
        if (fs.existsSync(repo.localPath)) {
            fs.rmSync(repo.localPath, { recursive: true, force: true })
        }

        await repo.deleteOne();

        res.json({
            success: true,
            message: "Repository deleted"
        })
    } catch (error) {
        res.status(500).json({ message: "failes to delete repo" })
    }
}

export const scanRepository = async (req: Request, res: Response)=>{
    try {
        const user = (req as any).user;

        const repo = await Repository.findOne({
            _id:req.params.id,
            user: user._id,
        })

        if(!repo){
            return res.status(404).json({message: "Repository nnot found"});
        }

        const files = scanCodeFiles(repo.localPath);

        return res.json({
            success:true,
            totalFiles: files.length,
            files
        })
    } catch (error) {
        return res.status(500).json({message: "Scan Failed"})
    }
}