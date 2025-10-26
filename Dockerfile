FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn builder

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

RUN yarn install --production --frozen-lockfile
