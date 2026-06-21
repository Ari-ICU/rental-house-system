# /server/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++ openssl

COPY package*.json ./

RUN npm install

# Copy Prisma schema and generate client (Prisma 5 - no config file needed)
COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
