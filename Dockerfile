FROM node:lts-alpine3.13 As cache

# RUN apt install -y libgbm-dev
# RUN apk add libgbm-dev

# RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# EXPOSE 8000

COPY package.json /usr/src/app

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      yarn

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install

# Puppeteer v10.0.0
RUN yarn add puppeteer@10.0.0

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /usr/src/app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/src/app

RUN npm audit fix

FROM node:lts-alpine3.13
# RUN npm config set unsafe-perm true

COPY --from=cache /usr/src/app/ /usr/src/app/
COPY . /usr/src/app/
