import { pipeline, env, type FeatureExtractionPipeline } from "@xenova/transformers"

// In Vercel serverless, only /tmp is writable. Configure cache there.
env.cacheDir = "/tmp/.cache/transformers"
env.allowLocalModels = false

const MODEL_ID = "Xenova/all-MiniLM-L6-v2"

let embedder: FeatureExtractionPipeline | null = null

export async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", MODEL_ID)
  }
  return embedder
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder()
  const output = await model(text, { pooling: "mean", normalize: true })
  return Array.from(output.data as Float32Array)
}
