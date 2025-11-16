FROM node:20-alpine

WORKDIR /app

# только package*.json для кеша
COPY package*.json ./
RUN npm install

# остальной код
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
