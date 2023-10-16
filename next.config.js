/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
//   basePath: process.env.BASE_PATH,
//   assetPrefix: process.env.BASE_PATH,
}

let path = "/"

if (process.env.BASE_PATH) {
    path = process.env.BASE_PATH
}

module.exports = {
    // basePath: process.env.BASE_PATH,
    // assetPrefix: process.env.BASE_PATH,
    async rewrites() {
        return [
            {
                source: path,
                destination: '/',
            },
        ]
    },
    nextConfig
}
