FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm test && npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV CODED_API_HOST=0.0.0.0
ENV CODED_API_PORT=8787

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
COPY --from=build /app/deploy ./deploy

EXPOSE 8787

CMD ["npm", "run", "api"]
