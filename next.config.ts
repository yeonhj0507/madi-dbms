import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 성능 최적화
  compress: true,
  
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
  
  // Standalone 빌드 (Docker용)
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
};

export default nextConfig;
