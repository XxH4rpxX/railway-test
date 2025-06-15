FROM node:18

WORKDIR /app
COPY . .

RUN npm install
RUN npx playwright install --with-deps

EXPOSE 3000

CMD ["node", "server.js"]
