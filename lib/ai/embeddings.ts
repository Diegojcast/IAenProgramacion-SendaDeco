// BAAI/bge-small-en-v1.5 is tagged as `feature-extraction` on HF Hub.
// sentence-transformers/all-MiniLM-L6-v2 is tagged `sentence-similarity`,
// which routes to a different pipeline that does not return raw embeddings.
const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5"

async function hfPost(inputs: string | string[]): Promise<unknown> {
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`HuggingFace API error ${res.status}: ${text}`)
  }
  return res.json()
}

// Feature-extraction returns token-level embeddings (seq_len × hidden_size).
// Mean-pool across tokens to get a single sentence embedding.
function meanPool(tokenEmbeddings: number[][]): number[] {
  const dim = tokenEmbeddings[0].length
  const result = new Array<number>(dim).fill(0)
  for (const token of tokenEmbeddings) {
    for (let i = 0; i < dim; i++) result[i] += token[i]
  }
  return result.map((v) => v / tokenEmbeddings.length)
}

export async function getEmbedding(text: string): Promise<number[]> {
  const data = await hfPost(text) as number[][]
  return meanPool(data)
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const data = await hfPost(texts) as number[][][]
  return data.map(meanPool)
}
