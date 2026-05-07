export interface FileStats {
  fileName: string;
  language: string;
  totalLines: number;
  codeLines: number;
  blankLines: number;
  functionCount: number;
  importCount: number;
  variableCount: number;
}

const functionPatterns: Record<string, RegExp> = {
  javascript: /^\s*(async\s+)?function\s+\w+|^\s*const\s+\w+\s*=\s*(async\s+)?\(.*\)\s*=>/gm,
  typescript: /^\s*(async\s+)?function\s+\w+|^\s*const\s+\w+\s*=\s*(async\s+)?\(.*\)\s*=>|^\s*(public|private|protected)?\s*(async\s+)?\w+\s*\(.*\)\s*[:{]/gm,
  java: /^\s*(public|private|protected)?\s*(static\s+)?\w+\s+\w+\s*\(.*\)\s*\{/gm,
  python: /^\s*def\s+\w+\s*\(/gm,
};

const importPatterns: Record<string, RegExp> = {
  javascript: /^\s*(import\s+|require\s*\()/gm,
  typescript: /^\s*import\s+/gm,
  java: /^\s*import\s+/gm,
  python: /^\s*(import\s+|from\s+\w+\s+import)/gm,
};

const variablePatterns: Record<string, RegExp> = {
  javascript: /^\s*(const|let|var)\s+\w+/gm,
  typescript: /^\s*(const|let|var)\s+\w+|^\s*(private|public|protected|readonly)\s+\w+/gm,
  java: /^\s*(private|public|protected|static)?\s*\w+\s+\w+\s*[=;]/gm,
  python: /^\s{0,4}\w+\s*=/gm,
};

function countMatches(text: string, pattern: RegExp | undefined): number {
  if (!pattern) {return 0;}
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

export function analyzeFile(
  content: string,
  fileName: string,
  language: string
): FileStats {
  const lines = content.split("\n");
  const totalLines = lines.length;
  const blankLines = lines.filter((line) => line.trim() === "").length;
  const codeLines = totalLines - blankLines;

  const functionCount = countMatches(content, functionPatterns[language]);
  const importCount = countMatches(content, importPatterns[language]);
  const variableCount = countMatches(content, variablePatterns[language]);

  return {
    fileName,
    language,
    totalLines,
    codeLines,
    blankLines,
    functionCount,
    importCount,
    variableCount
  };
}