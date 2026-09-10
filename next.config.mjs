import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingRoot: projectRoot,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // News images come from several trusted editorial sources. Let Next/Vercel
    // resize and convert them instead of sending the original full-size asset to
    // every device. The editor controls these URLs; they are not user supplied.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },
}

export default nextConfig
