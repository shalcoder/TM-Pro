FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for caching)
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
CMD ["npm", "start"]
