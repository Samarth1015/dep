# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_RABBITMQ_URL
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RABBITMQ_URL=$NEXT_PUBLIC_RABBITMQ_URL
COPY package*.json ./
RUN npm ci --loglevel=verbose
COPY . .
RUN npm run build
# Stage 2: Production
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]