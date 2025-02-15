/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handling the ref deprecation
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@radix-ui/react-slot': new URL('./node_modules/@radix-ui/react-slot', import.meta.url).pathname
      }
    }
    return config
  }
}

export default nextConfig;