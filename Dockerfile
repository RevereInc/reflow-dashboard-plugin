# Dockerfile for Reflow Dashboard Plugin
ARG NODE_VERSION=18-alpine
FROM node:${NODE_VERSION} as builder
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Use 'npm ci' for cleaner installs if package-lock.json exists
# Or adapt based on your package manager (e.g., yarn install --frozen-lockfile, pnpm i --frozen-lockfile)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile --production=false; \
    elif [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile --prod=false; \
    else npm install --omit=dev; fi
COPY . .
RUN npm run build

FROM node:${NODE_VERSION} as runner
WORKDIR /app
ENV NODE_ENV production
# Expose port 3000 (standard for Next.js)
EXPOSE 3000
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

# Standard Next.js start command on port 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]