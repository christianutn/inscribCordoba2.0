# Usa una imagen más ligera basada en Alpine
FROM node:20-alpine

# Instala las dependencias necesarias para compilar módulos nativos
RUN apk add --no-cache python3 make g++

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias (incluyendo las de desarrollo)
RUN npm install --production=false

# Copia todo el contenido de la carpeta actual al contenedor
COPY . .

# Expone el puerto en el que la aplicación está escuchando
EXPOSE 4000

# Comando por defecto para iniciar la app
CMD ["npm", "start"]