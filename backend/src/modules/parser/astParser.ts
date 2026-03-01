import { Project, SyntaxKind } from "ts-morph";

export type ParsedEntity = {
    repoId: string;
    filePath: string;
    name: string;
    type: "function" | "class" | "method" | "arrow" | "interface";
    parameters: string[];
    returnType: string;
    startLine: number;
    endLine: number;
    content: string;
}

export async function parseRepository(repoId: string, filePath: string[]): Promise<ParsedEntity[]> {
    const project = new Project({
        skipAddingFilesFromTsConfig: true,
    });

    project.addSourceFilesAtPaths(filePath);

    const sourceFiles = project.getSourceFiles();
    const entities: ParsedEntity[] = [];

    for (const sourceFile of sourceFiles) {
        const currentFilePath = sourceFile.getFilePath();

        for (const fn of sourceFile.getFunctions()) {
            entities.push({
                repoId,
                filePath: currentFilePath,
                name: fn.getName() || "Anonymous",
                type: "function",
                parameters: fn.getParameters().map(p => p.getName()),
                returnType: fn.getReturnType().getText(),
                startLine: fn.getStartLineNumber(),
                endLine: fn.getEndLineNumber(),
                content: fn.getText(),
            });
        }

        const VariableStatements = sourceFile.getVariableStatements();
        for(const statement of VariableStatements){
            for(const declaration of statement.getDeclarations()){
                const initializer = declaration.getInitializer();

                if(initializer && initializer.getKind() === SyntaxKind.ArrowFunction){
                    const arrowFn = initializer.asKindOrThrow(SyntaxKind.ArrowFunction);

                    entities.push({
                        repoId,
                        filePath: currentFilePath,
                        name: declaration.getName(),
                        type: "arrow",
                        parameters: arrowFn.getParameters().map(p => p.getName()),
                        returnType: arrowFn.getReturnType().getText(),
                        startLine: arrowFn.getStartLineNumber(),
                        endLine: arrowFn.getEndLineNumber(),
                        content: arrowFn.getText(),
                    })
                }
            }
        }


        for(const cls of sourceFile.getClasses()){
            entities.push({
                repoId,
                filePath: currentFilePath,
                name: cls.getName() || "anonymous_class",
                type: "class",
                parameters: [],
                returnType: "",
                startLine: cls.getStartLineNumber(),
                endLine: cls.getEndLineNumber(),
                content: cls.getText(),
            })
            

            for(const method of cls.getMethods()){
                entities.push({
                    repoId,
                    filePath: currentFilePath,
                    name: method.getName(),
                    type: "method",
                    parameters: method.getParameters().map(p => p.getName()),
                    returnType: method.getReturnType().getText(),
                    startLine: method.getStartLineNumber(),
                    endLine: method.getEndLineNumber(),
                    content: method.getText(),
                })
            }
        }

        for(const iface of sourceFile.getInterfaces()){
            entities.push({
                repoId,
                filePath: currentFilePath,
                name: iface.getName(),
                type: "interface",
                parameters: [],
                returnType: "",
                startLine: iface.getStartLineNumber(),
                endLine: iface.getEndLineNumber(),
                content: iface.getText(),
            })
        }
    }

    return entities;
}