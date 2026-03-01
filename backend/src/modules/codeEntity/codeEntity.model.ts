import mongoose from "mongoose";
import { Schema, type Document } from "mongoose";

export interface ICodeEntity extends Document {
    repoId: mongoose.Types.ObjectId;
    filePath: string;
    name: string;
    type: string;
    parameters: string[];
    returnType: string;
    startLine: number;
    endLine: number;
    content: string;
    embeddingId?: string;
}

const codeEntitySchema = new Schema<ICodeEntity>(
    {
        repoId: {
            type: Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
            index: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["function", "class", "method", "arrow", "interface"],
            required: true,
        },
        parameters: {
            type: [String],
            default: [],
        },
        returnType: {
            type: String,
            default: "",
        },
        startLine: {
            type: Number,
            required: true
        },
        endLine: {
            type: Number,
            required: true,
        },
        content: {
            type: String,
            required: true
        },
        embeddingId:{
            type: String,
        }
    },
    {timestamps: true}
);

export const CodeEntity = mongoose.model<ICodeEntity>("CodeEntity", codeEntitySchema)