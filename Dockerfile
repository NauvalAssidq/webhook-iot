# back-end/Dockerfile (Production Version)

# --- Stage 1: Build Stage ---
# This stage installs all dependencies and prepares our files
FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# --- Stage 2: Production Stage ---
# This stage creates the final, clean image
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app .

EXPOSE ${PORT}

CMD [ "node", "./bin/www" ]