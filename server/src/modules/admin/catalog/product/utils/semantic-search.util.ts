export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0
  }

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/** Reciprocal rank fusion for hybrid keyword + vector result lists. */
export function mergeHybridProductIds(
  keywordIds: string[],
  semanticIds: string[],
  limit: number,
): string[] {
  const scores = new Map<string, number>()
  const k = 60

  keywordIds.forEach((id, index) => {
    scores.set(id, (scores.get(id) || 0) + 1 / (k + index + 1))
  })

  semanticIds.forEach((id, index) => {
    scores.set(id, (scores.get(id) || 0) + 1 / (k + index + 1))
  })

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)
}
