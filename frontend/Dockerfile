FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Você precisa garantir que axios esteja instalado
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]