# Dockerfile for Reflow Dashboard Plugin
ARG NODE_VERSION=18-alpine
FROM node:${NODE_VERSION} as builder
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# CORRECTED: Remove --omit=dev to install ALL dependencies needed for build
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile --production=false; \
    elif [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile --prod=false; \
    else npm install; fi
COPY . .
RUN npm run build

FROM node:${NODE_VERSION} as runner
WORKDIR /app
ENV NODE_ENV production
EXPOSE 3000
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

CMD ["node_modules/.bin/next", "start", "-p", "3000"]
