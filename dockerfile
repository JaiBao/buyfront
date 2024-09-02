# 開發階段
FROM node:18-alpine as develop-stage
WORKDIR /app
COPY package*.json ./

# 安裝 bash
RUN apk add --no-cache bash

# 設置環境變數
ARG ENV_FILE
ENV ENV_FILE=${ENV_FILE}

# 使用已安裝的 Yarn 安裝依賴
COPY . .
RUN cp "./${ENV_FILE}" /app/.env \
    && yarn install

# 構建階段
FROM develop-stage as build-stage
RUN yarn build

# 生產階段
FROM node:18-alpine as production-stage
WORKDIR /app

# 設置時區
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime \
    && echo "Asia/Taipei" > /etc/timezone \
    && apk del tzdata

COPY --from=build-stage /app/.output /app/.output
EXPOSE 3000

# 使用 node 運行構建項目
ENTRYPOINT ["node", ".output/server/index.mjs"]