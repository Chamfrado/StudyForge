FROM node:22-bookworm-slim AS node-base

FROM python:3.13-slim-bookworm AS dev

WORKDIR /app

ENV APP_MODE=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node-base /usr/local/bin/node /usr/local/bin/node
COPY --from=node-base /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /app/api
COPY api/pyproject.toml ./pyproject.toml
COPY api/app ./app
RUN pip install --upgrade pip \
    && pip install -e ".[dev]"

WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci

WORKDIR /app
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000 8000

ENTRYPOINT ["./docker-entrypoint.sh"]

FROM node-base AS web-builder

WORKDIR /app/web

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web ./
RUN npm run build

FROM python:3.13-slim-bookworm AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=web-builder /usr/local/bin/node /usr/local/bin/node

WORKDIR /app/api
COPY api/pyproject.toml ./
COPY api/app ./app
COPY api/alembic ./alembic
COPY api/alembic.ini ./alembic.ini

RUN pip install --upgrade pip \
    && pip install -e .

RUN mkdir -p /app/api/storage/materials

WORKDIR /app/web
COPY --from=web-builder /app/web/.next/standalone ./
COPY --from=web-builder /app/web/.next/static ./.next/static
COPY --from=web-builder /app/web/public ./public

WORKDIR /app
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
