FROM node:24-alpine AS builder

WORKDIR /app

COPY . /app/

RUN apk add --no-cache wget
RUN npm ci
RUN npm run build
RUN cp -R ./node_modules/.prisma ./.prisma

RUN npm uninstall prisma
RUN rm -rf ./node_modules
RUN npm ci --omit=dev
RUN cp -R ./.prisma ./node_modules/.prisma

FROM node:24-alpine AS production

WORKDIR /app
RUN chown -R 1000:1000 /app
USER 1000:1000

COPY --chown=1000:1000 package.json package-lock.json /app/

COPY --chown=1000:1000 --from=builder /app/dist/src /app
COPY --chown=1000:1000 --from=builder /app/node_modules /app/node_modules

EXPOSE 4000

ENV NODE_ENV production

CMD [ "node", "/app/main.js" ]
