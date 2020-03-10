FROM node:13.0.1-alpine
COPY . /
CMD ["npm", "run", "test-reversibility"]
