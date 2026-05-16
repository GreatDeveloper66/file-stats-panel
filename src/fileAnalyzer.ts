export interface FileStats {
  fileName: string;
  language: string;
  totalLines: number;
  codeLines: number;
  blankLines: number;
  functionCount: number;
  importCount: number;
  variableCount: number;
  exportCount: number;
  functionNames: string[];
  variableNames: string[];
}

const functionPatterns: Record<string, RegExp> = {
  javascript: /^(export\s+)?(default\s+)?(async\s+)?function\s+\w+|^(export\s+)?(const|let)\s+\w+\s*=\s*(async\s+)?\(.*\)\s*=>/gm,
  typescript: /^(export\s+)?(default\s+)?(async\s+)?function\s+\w+|^(export\s+)?(const|let)\s+\w+\s*=\s*(async\s+)?\(.*\)\s*=>|^\s*(public|private|protected)?\s*(async\s+)?\w+\s*\(.*\)\s*[:{]/gm,
  java: /^\s*(public|private|protected)?\s*(static\s+)?\w+\s+\w+\s*\(.*\)\s*\{/gm,
  python: /^\s*def\s+\w+\s*\(/gm,
};

const variablePatterns: Record<string, RegExp> = {
  javascript: /^(export\s+)?(const|let|var)\s+\w+(?!\s*=\s*(async\s+)?\()/gm,
  typescript: /^(export\s+)?(const|let|var)\s+\w+(?!\s*=\s*(async\s+)?\()|^(export\s+)?(private|public|protected|readonly)\s+\w+/gm,
  java: /^\s{4}(private|public|protected|static)?\s*\w+\s+\w+\s*[=;]/gm,
  python: /^\w+\s*=/gm,
};
const importPatterns: Record<string, RegExp> = {
  javascript: /^\s*(import\s+|require\s*\()/gm,
  typescript: /^\s*import\s+/gm,
  java: /^\s*import\s+/gm,
  python: /^\s*(import\s+|from\s+\w+\s+import)/gm,
};

const exportPatterns: Record<string, RegExp> = {
  javascript: /^(export\s+(default\s+)?|module\.exports\s*=|exports\.\w+\s*=)/gm,
  typescript: /^(export\s+(default\s+)?|module\.exports\s*=|exports\.\w+\s*=)/gm,
  java: /^\s*(public)\s+(static\s+|final\s+|abstract\s+)?\w+/gm,
  python: /^\s*__all__\s*=/gm,
};

const functionNamePatterns: Record<string, RegExp> = {
  javascript: /^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)|^(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(/gm,
  typescript: /^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)|^(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(|^\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(/gm,
  java: /^\s*(?:public|private|protected)?\s*(?:static\s+)?\w+\s+(\w+)\s*\(/gm,
  python: /^\s*def\s+(\w+)\s*\(/gm,
};

const variableNamePatterns: Record<string, RegExp> = {
  
  javascript: /^(?:export\s+)?(?:const|let|var)\s+(\w+)(?!\s*=\s*(?:async\s+)?\()/gm,
  typescript: /^(?:export\s+)?(?:const|let|var)\s+(\w+)(?!\s*=\s*(?:async\s+)?\()|^(?:export\s+)?(?:private|public|protected|readonly)\s+(\w+)/gm,
  java: /^\s{4}(?:private|public|protected|static)?\s+(\w+)\s+\w+\s*[=;]/gm,
  python: /^\w+\s*=/gm,
};



function countMatches(text: string, pattern: RegExp | undefined): number {
  if (!pattern) { return 0; }
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

export function getMatches(text: string, pattern: RegExp): string[] {
  const results: string[] = [];
  const matches = text.matchAll(pattern);
  for (const match of matches) {
    // Try each capture group in order, take the first one that has a value
    const name = match[1] || match[2] || match[3];
    if (name) {
      results.push(name.trim());
    }
  }
  return results;
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
  const exportCount = countMatches(content, exportPatterns[language]);
  const functionNames = getMatches(content, functionNamePatterns[language]);
  const variableNames = getMatches(content, variableNamePatterns[language]);

  return {
    fileName,
    language,
    totalLines,
    codeLines,
    blankLines,
    functionCount,
    importCount,
    variableCount,
    exportCount,
    functionNames,
    variableNames
  };
}