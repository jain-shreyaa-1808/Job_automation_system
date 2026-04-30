FROM node:22-alpine AS base
WORKDIR /workspace

FROM base AS deps
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build --workspace @job-automation/shared && npm run build --workspace @job-automation/worker

FROM node:22-alpine AS runtime
WORKDIR /workspace
ENV NODE_ENV=production
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/worker/dist ./apps/worker/dist
COPY --from=build /workspace/apps/worker/package.json ./apps/worker/package.json
COPY --from=build /workspace/packages/shared/dist ./packages/shared/dist
CMD ["node", "apps/worker/dist/index.js"]
