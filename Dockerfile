# Stage 1: Build Stage
# Use the Node version specified in project config
# Define ARG before FROM so the first FROM can use it if needed
ARG NODE_VERSION={{.NodeVersion}}
# Directly use template value here
FROM node:{{.NodeVersion}} as builder

WORKDIR /app

# Copy package files and install dependencies first for layer caching
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Run the build command
RUN npm run build

# Stage 2: Production Stage
# Use the SAME Node image tag as the build stage for consistency and simplicity
# Directly use the template value again, avoid ARG scoping issues for FROM
FROM node:{{.NodeVersion}} as runner

WORKDIR /app

ENV NODE_ENV production

# Copy necessary files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

# Command to run the application
# Uses the port specified in the config directly via template
CMD ["node_modules/.bin/next", "start", "-p", "{{.AppPort}}"]
