FROM node:20

WORKDIR /apps

COPY beervana-frontend/package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]