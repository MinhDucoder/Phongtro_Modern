import { pathToFileURL } from 'url';
import { resolve as pathResolve, extname as pathExtname } from 'path';

export async function resolve(specifier, context, nextResolve) {
  // Handle ~ alias
  if (specifier.startsWith('~/')) {
    const aliasPath = specifier.replace('~/', './src/');
    const resolvedPath = pathResolve(process.cwd(), aliasPath);
    
    // If no extension provided, default to .js; otherwise respect existing extension (.mjs, .cjs, .json, etc.)
    let finalPath = resolvedPath;
    if (!pathExtname(finalPath)) {
      finalPath += '.js';
    }
    
    return {
      shortCircuit: true,
      url: pathToFileURL(finalPath).href
    };
  }
  
  return nextResolve(specifier, context);
}
