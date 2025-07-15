# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine as production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads/syllabi /app/uploads/assignments && \
    chown -R node:node /app/uploads

USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]