# Base image
FROM node:20.2

# Install dependencies for canvas
RUN apt-get update \ 
    && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

# Install fonts
RUN apt-get install -y fonts-noto fonts-noto-color-emoji

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json tsconfig*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Creates a "dist" folder with the production build
RUN npm run build

EXPOSE 3000

# Start the server using the production build
# CMD ["npm", "run", "start:prod"] 
# CMD [ "node", "dist/src/main.js" ]
CMD ["npm", "run", "start:prod"] 