FROM node:14-alpine

# RUN apk add --no-cache \
#       chromium \
#       nss \
#       freetype \
#       harfbuzz \
#       ca-certificates \
#       ttf-freefont

RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium \
      nss

# RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install --registry=https://registry.npmmirror.com

RUN npm audit fix

CMD ["node","index.js"]
