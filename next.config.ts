/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false, // disable LightningCSS to avoid missing binary errors
  },
}

export default nextConfig
