FROM node:20-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the production server
# We use db push to ensure the Postgres DB is ready and synced
CMD ["sh", "-c", "npx prisma db push && npm start"]
