# --- Etapa 1: build de la aplicación Angular ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# --- Etapa 2: servidor Nginx ---
FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="upc-denunciape-web"

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular 22 (application builder) genera la salida en dist/<project>/browser
COPY --from=build /app/dist/DenunciaPeWeb/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
