FROM node:15-alpine
WORKDIR /usr/src/app
RUN apk add git --no-cache
# copying just package.json first means we only have to reinstall dependencies when package.json is updated
# and not every time we build the container
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "index.js"]