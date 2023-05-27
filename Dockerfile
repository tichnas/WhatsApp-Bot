FROM node:16-slim
LABEL author="tichnas"

USER node
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .

ENTRYPOINT [ "npm", "start" ]
