FROM node:alpine
WORKDIR /usr/src/app
RUN apk add git --no-cache
RUN npm i
CMD ["node", "index.js"]