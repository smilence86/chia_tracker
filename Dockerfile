FROM node:14-alpine As cache

# RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN npm install

# Puppeteer v10.0.0
# RUN yarn add puppeteer@10.0.0

# Add user so we don't need --no-sandbox.
# RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
#     && mkdir -p /home/pptruser/Downloads /usr/src/app \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /usr/src/app

RUN npm audit fix

FROM node:14-alpine
# RUN npm config set unsafe-perm true

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=cache /usr/src/app/ /usr/src/app/

COPY . /usr/src/app/

WORKDIR /usr/src/app

CMD ["node","index.js"]
