FROM node:18.15.0-alpine3.17 As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build profile

CMD ["node", "dist/apps/profile/main"]
