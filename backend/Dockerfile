# Backend Dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node","src/server.js"]
