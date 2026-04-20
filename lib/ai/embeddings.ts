// All multilingual sentence-transformer models on HF Hub are tagged as
// sentence-similarity, so the router always dispatches to SentenceSimilarityPipeline.
// We use that pipeline's native format: { source_sentence, sentences } → number[]
// which returns cosine similarity scores directly — no manual pooling or cosine needed.
const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

// Max sentences per request — keep requests reasonably sized.
const BATCH_SIZE = 64

async function hfSimilarityBatch(query: string, sentences: string[]): Promise<number[]> {
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
      // Block until the model is warm instead of getting a 503 cold-start error.
      "x-wait-for-model": "true",
    },
    body: JSON.stringify({
      inputs: {
        source_sentence: query,
        sentences,
      },
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`HuggingFace API error ${res.status}: ${text}`)
  }
  const json = await res.json()
  if (!Array.isArray(json)) {
    const detail = typeof json === "object" && json !== null ? JSON.stringify(json) : String(json)
    throw new Error(`HuggingFace unexpected response (model may be loading): ${detail}`)
  }
  return json as number[]
}

/**
 * Returns a cosine similarity score in [0, 1] for each sentence against the query.
 * Batches requests when there are more than BATCH_SIZE sentences.
 */
export async function getSimilarityScores(
  query: string,
  sentences: string[]
): Promise<number[]> {
  if (sentences.length === 0) return []
  const normalizedQuery = query.toLowerCase().trim()
  const normalizedSentences = sentences.map((s) => s.toLowerCase().trim())

  const results: number[] = []
  for (let i = 0; i < normalizedSentences.length; i += BATCH_SIZE) {
    const chunk = normalizedSentences.slice(i, i + BATCH_SIZE)
    const scores = await hfSimilarityBatch(normalizedQuery, chunk)
    results.push(...scores)
  }
  return results
}
