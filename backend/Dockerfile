# Usar una imagen base de Node.js
FROM node:20

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto en el que corre la aplicación
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
