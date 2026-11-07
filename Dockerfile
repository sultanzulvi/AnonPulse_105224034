# ============================================================
# Dockerfile: Multi-Stage Build & Non-Root Hardened Container
# Proyek: AnonPulse (Next.js 16 + Node.js 22 LTS Alpine)
# Standar: CIS Docker Benchmark & NIST SP 800-190
# ============================================================

# ------------------------------------------------------------
# Stage 1: Dependencies Cache
# ------------------------------------------------------------
FROM node:22-alpine AS deps
# Menambahkan libc6-compat bila diperlukan oleh pustaka native tertentu di Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Salin hanya berkas deklarasi dependensi untuk memaksimalkan layer caching
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ------------------------------------------------------------
# Stage 2: Source Builder
# ------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client terlebih dahulu
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate

# Build artefak standalone
RUN npm run build

# ------------------------------------------------------------
# Stage 3: Hardened Production Runner (Minimal Attack Surface)
# ------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Buat grup dan pengguna non-root (Least Privilege - UID/GID 1001)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Salin public static assets
COPY --from=builder /app/public ./public

# Siapkan folder .next dengan hak kepemilikan non-root
RUN mkdir .next && chown nextjs:nodejs .next

# Salin hasil build standalone yang telah dioptimasi
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Jalankan container strictly sebagai non-root
USER nextjs

EXPOSE 3000

# Server Next.js standalone entrypoint
CMD ["node", "server.js"]

