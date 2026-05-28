FROM node:20-alpine AS deps
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:3000/api/v1
ARG VITE_WEBSOCKET_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM deps AS build
COPY index.html ./
COPY tsconfig.json tsconfig.node.json vite.config.ts ./
COPY postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
