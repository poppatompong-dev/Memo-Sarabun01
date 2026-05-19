import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ให้ better-sqlite3 ทำงานได้บน server side
  serverExternalPackages: ['better-sqlite3'],
}

export default nextConfig
