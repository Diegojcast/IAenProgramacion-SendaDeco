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
  if (tokenEmbeddings.length === 0) return []
  const dim = tokenEmbeddings[0].length
  const result = new Array<number>(dim).fill(0)
  for (const token of tokenEmbeddings) {
    for (let i = 0; i < dim; i++) result[i] += token[i]
  }
  return result.map((v) => v / tokenEmbeddings.length)
}

// The HF feature-extraction API may return different shapes depending on the
// model and whether the input is a single string or a batch:
//   - number[]          → already a pooled vector (return as-is)
//   - number[][]        → [seq_len, hidden_size] (mean-pool rows)
//   - number[][][1...]  → [1, seq_len, hidden_size] (unwrap batch dim, then mean-pool)
function extractEmbedding(raw: unknown): number[] {
  const arr = raw as number[] | number[][] | number[][][]
  // Case 1: flat vector — already pooled
  if (typeof arr[0] === "number") {
    return arr as number[]
  }
  // Case 2: batch wrapper [1, seq_len, dim] — unwrap first element
  if (Array.isArray((arr as number[][][])[0][0])) {
    return meanPool((arr as number[][][])[0])
  }
  // Case 3: token-level matrix [seq_len, dim]
  return meanPool(arr as number[][])
}

export async function getEmbedding(text: string): Promise<number[]> {
  const normalized = text.toLowerCase().trim()
  const raw = await hfPost(normalized)
  return extractEmbedding(raw)
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const normalized = texts.map((t) => t.toLowerCase().trim())
  const raw = await hfPost(normalized) as unknown[]
  return raw.map(extractEmbedding)
}
