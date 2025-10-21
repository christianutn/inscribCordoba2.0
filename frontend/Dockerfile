# Etapa 1: build de React
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine

# Copiar build al directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
