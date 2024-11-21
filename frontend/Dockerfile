# Usa una imagen más ligera basada en Alpine
FROM node:20-alpine

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias (incluyendo devDependencies)
RUN npm install --production=false

# Copia todo el contenido de la carpeta actual al contenedor
COPY . .

# Expone el puerto 3000 (ajústalo si es necesario)
EXPOSE 3000

# Comando por defecto para iniciar la app
CMD ["npm", "start"]