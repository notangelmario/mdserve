/**
 * Inputs a path and outputs an string array and filters out empty elements.
 * 
 * @param {string} path - Path to split
 * @returns {string[]} Array of path split at /
*/
export const splitPath = (path: string): string[] => path.split("/").filter(Boolean);
