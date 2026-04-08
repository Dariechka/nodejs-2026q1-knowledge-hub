FROM node:24-alpine AS builder

WORKDIR /app

COPY . /app/

RUN npm ci
RUN npm run build

FROM node:24-alpine AS production

WORKDIR /app
RUN chown -R 1000:1000 /app
USER 1000:1000

COPY --chown=1000:1000 package.json package-lock.json /app/
RUN npm ci --omit=dev

COPY --chown=1000:1000 --from=builder /app/dist /app

EXPOSE 4000

ENV NODE_ENV production

CMD [ "node", "/app/main.js" ]
