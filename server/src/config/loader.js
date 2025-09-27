import { pathToFileURL } from 'url';
import { resolve as pathResolve } from 'path';

export async function resolve(specifier, context, nextResolve) {
  // Handle ~ alias
  if (specifier.startsWith('~/')) {
    const aliasPath = specifier.replace('~/', './src/');
    const resolvedPath = pathResolve(process.cwd(), aliasPath);
    
    // Add .js extension if not present
    let finalPath = resolvedPath;
    if (!finalPath.endsWith('.js') && !finalPath.endsWith('.json')) {
      finalPath += '.js';
    }
    
    return {
      shortCircuit: true,
      url: pathToFileURL(finalPath).href
    };
  }
  
  return nextResolve(specifier, context);
}
