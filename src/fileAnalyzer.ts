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
  importNames: string[];
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

//find the names of the functions being imported
const importNamePatterns: Record<string, RegExp> = {
  // JS: ES module named imports { a, b as c } AND CommonJS require destructuring
  javascript: /import\s+(?:([\w$]+)\s*,\s*)?(?:\{([^}]+)\}|(\*\s*as\s+[\w$]+)|([\w$]+))?\s*from\s*['"][^'"]+['"]|(?:const|let|var)\s*\{([^}]+)\}\s*=\s*require\(['"][^'"]+['"]\)/g,
  typescript: /import\s+(?:type\s+)?(?:([\w$]+)\s*,\s*)?(?:\{([^}]+)\}|(\*\s*as\s+[\w$]+)|([\w$]+))?\s*from\s*['"][^'"]+['"]/g,
  java: /import\s+(?:static\s+)?([\w.]+(?:\.\*|\.\w+))\s*;/g,
  python: /^\s*(?:from\s+[\w.]+\s+import\s+([\w\s,*]+)|import\s+([\w\s,.]+))/gm,
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

interface ImportStats {
  count: number;
  names: string[];
}

function extractImportNames(fileContent: string, language: string): ImportStats {
  const pattern = importNamePatterns[language];
  if (!pattern) {
    return { count: 0, names: [] };
  }

  // Reset lastIndex in case this regex object was reused with the `g` flag
  pattern.lastIndex = 0;

  const names: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(fileContent)) !== null) {
    switch (language) {
      case 'javascript':
      case 'typescript':
        names.push(...extractJsTsNames(match));
        break;
      case 'java':
        names.push(...extractJavaNames(match));
        break;
      case 'python':
        names.push(...extractPythonNames(match));
        break;
    }

    // Guard against zero-length matches causing an infinite loop
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++;
    }
  }

  return {
    count: names.length,
    names,
  };
}

function extractJsTsNames(match: RegExpExecArray): string[] {
  const [, defaultName, namedBlock, namespaceImport, singleImport] = match;
  const result: string[] = [];

  if (defaultName) {
    result.push(defaultName.trim());
  }

  if (namedBlock) {
    // namedBlock looks like: "foo, bar as baz, qux"
    const pieces = namedBlock.split(',').map(p => p.trim()).filter(Boolean);
    for (const piece of pieces) {
      // "bar as baz" -> we want "baz" (the local name actually used in the file)
      const asMatch = piece.match(/^(?:type\s+)?[\w$]+\s+as\s+([\w$]+)$/);
      result.push(asMatch ? asMatch[1] : piece.replace(/^type\s+/, ''));
    }
  }

  if (namespaceImport) {
    // "* as foo" -> "foo"
    const asMatch = namespaceImport.match(/as\s+([\w$]+)/);
    if (asMatch) result.push(asMatch[1]);
  }

  if (singleImport) {
    result.push(singleImport.trim());
  }

  return result;
}

function extractJavaNames(match: RegExpExecArray): string[] {
  const fullPath = match[1];
  if (!fullPath) return [];

  if (fullPath.endsWith('.*')) {
    // Wildcard import — no individual name, just note the package
    return [`${fullPath} (wildcard)`];
  }

  const segments = fullPath.split('.');
  return [segments[segments.length - 1]];
}

function extractPythonNames(match: RegExpExecArray): string[] {
  const [, fromImportList, plainImportList] = match;
  const result: string[] = [];

  const rawList = fromImportList ?? plainImportList;
  if (!rawList) return result;

  const pieces = rawList.split(',').map(p => p.trim()).filter(Boolean);
  for (const piece of pieces) {
    if (piece === '*') {
      result.push('* (wildcard)');
      continue;
    }
    // "foo as bar" -> "bar"
    const asMatch = piece.match(/^([\w.]+)\s+as\s+(\w+)$/);
    result.push(asMatch ? asMatch[2] : piece);
  }

  return result;
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

  const { count: importCount, names: importNames } = extractImportNames(content, language);
  const functionCount = countMatches(content, functionPatterns[language]);
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
    variableNames,
    importNames
  };
}