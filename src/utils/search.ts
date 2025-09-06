/**
 * Enhanced search utilities with better text normalization
 */

export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

export const isWithinDateRange = (date: string, startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate && !endDate) return true;
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return targetDate >= start && targetDate <= end;
  }

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return targetDate >= start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return targetDate <= end;
  }

  return true;
};

/**
 * Fuzzy search implementation for better matching
 */
export const fuzzyMatch = (query: string, target: string, threshold = 0.6): boolean => {
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);
  
  if (normalizedTarget.includes(normalizedQuery)) return true;
  
  // Calculate Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(normalizedQuery, normalizedTarget);
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity >= threshold;
};

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}