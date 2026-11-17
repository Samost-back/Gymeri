FROM node:22-slim

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

WORKDIR /app

# Manifests go first, so the install layer is rebuilt only when dependencies change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# The cache mount keeps downloaded packages between builds without putting them in the image.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "dev"]
