/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    serverExternalPackages: ["@xenova/transformers", "sharp"],
}

export default nextConfig