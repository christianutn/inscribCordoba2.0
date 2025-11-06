# Imagen base ligera de Node.js
FROM node:20-alpine

# Instalar herramientas necesarias para compilar dependencias nativas
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo los archivos de dependencias primero (mejor para caché)
COPY package*.json ./

# Instalar dependencias (puede usar --production si no necesitás devDependencies)
RUN npm install --production=false

RUN npm cache clean --force

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto en el que corre la app
EXPOSE 4000

# Variable de entorno opcional para diferenciar entornos
ENV NODE_ENV=production

# Comando por defecto para ejecutar el servidor
CMD ["npm", "start"]
