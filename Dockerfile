FROM node:lts-alpine3.13 As cache

# RUN apt install -y libgbm-dev
# RUN apk add libgbm-dev

# RUN mkdir -p /usr/src/
WORKDIR /usr/src/

# EXPOSE 8000

COPY package.json /usr/src/

# RUN apk add --no-cache udev ttf-freefont chromium git

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# ENV CHROMIUM_PATH /usr/bin/chromium-browser

RUN npm install

RUN npm audit fix

FROM node:lts-alpine3.13
RUN npm config set unsafe-perm true

COPY --from=cache /usr/src/ /usr/src/
COPY . /usr/src/
