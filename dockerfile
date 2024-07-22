# develop stage
FROM node:18-alpine as develop-stage
WORKDIR /app
COPY package*.json ./
# RUN npm i
COPY . .

ARG ENV_FILE
ENV ENV_FILE=${ENV_FILE}

RUN apk add --no-cache bash
RUN cp /app/${ENV_FILE} /app/.env && npm i

# build stage
FROM develop-stage as build-stage
RUN npm run build


# # 创建 SSL 目录
# COPY default.conf /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/nginx.conf
# RUN mkdir -p /etc/nginx/ssl
# production stage
FROM node:18-alpine as production-stage
WORKDIR /app


# 設置時間
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime \
    && echo "Asia/Taipei" > /etc/timezone \
    && apk del tzdata


COPY --from=build-stage /app/.output /app/.output
EXPOSE 3000


# 使用 node 運行構建項目
ENTRYPOINT ["node", ".output/server/index.mjs"]

