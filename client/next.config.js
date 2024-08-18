/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
            },
            {
                protocol: "https",
                hostname: "tailwindui.com",
                port: "",
            },
        ],
    },
    reactStrictMode: true,
    compress: true,
};

module.exports = nextConfig;
