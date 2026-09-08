FROM node:24-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
COPY contracts /app/contracts
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
