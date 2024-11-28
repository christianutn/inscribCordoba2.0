# 1. Imagen base de Node.js
FROM node:20 AS build

# 2. Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar el package.json y el package-lock.json (si existe) al contenedor
COPY package*.json ./

# 4. Instalar dependencias
RUN npm install

# 5. Copiar el resto del código de la aplicación
COPY . .

# 6. Construir la aplicación para producción
RUN npm run build

# 7. Servir la aplicación usando Nginx
FROM nginx:alpine

# 8. Copiar los archivos estáticos generados en la carpeta build al directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# 9. Copiar el archivo de configuración de Nginx personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 10. Exponer el puerto 80 para acceder a la aplicación
EXPOSE 80

# 11. Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
