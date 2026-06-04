/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  experimental: {
    // pdf-parse + @react-pdf run server-side only
    serverComponentsExternalPackages: [
      "pdf-parse",
      "@react-pdf/renderer",
      "pdfjs-dist",
      "tesseract.js",
      "@napi-rs/canvas",
    ],
  },
};

export default nextConfig;
