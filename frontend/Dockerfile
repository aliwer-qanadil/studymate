# Step 1: build the React app into static files (dist/)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: serve dist/ with nginx, which also forwards /api to the backend.
# The nginx image fills in templates/*.template from environment variables at start.
FROM nginx:1.29-alpine
ENV PORT=80 \
    BACKEND_URL=http://backend:8080 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/05-backend-url.envsh /docker-entrypoint.d/05-backend-url.envsh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD wget -q -O /dev/null http://127.0.0.1:${PORT}/ || exit 1
