# E:\intern_deploy\intern_backend\Dockerfile
# Use Node 20 as the base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma files separately to run generate early
COPY prisma ./prisma
RUN npx prisma generate

# Now copy the rest of your backend source code
COPY . .

# Build your TypeScript code
RUN npm run build

# Start the server (which runs from the built output)
CMD ["npm", "run", "start"]
