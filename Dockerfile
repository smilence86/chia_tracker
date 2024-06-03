FROM node:16-alpine AS builder

WORKDIR /usr/src/app

COPY package.json /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN npm install --omit=dev --registry=https://registry.npmmirror.com


FROM node:16-alpine

#RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont
  
# RUN apk add wqy-zenhei --update-cache --repository http://nl.alpinelinux.org/alpine/edge/testing

RUN wget https://github.com/notofonts/noto-cjk/raw/main/google-fonts/NotoSerifSC%5Bwght%5D.ttf && mkdir -p ~/.local/share/fonts/noto && cp *.ttf ~/.local/share/fonts/noto && fc-cache -f -v

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app /usr/src/app

COPY . /usr/src/app

RUN npm audit fix

CMD ["node","index.js"]
