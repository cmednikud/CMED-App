# Use Node.js v18 (recommended over v14 — newer, more secure)
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose the container port (use 8080 for containers, matches process.env.PORT)
EXPOSE 8080

# Start your server using index.js
CMD [ "node", "index.js" ]
