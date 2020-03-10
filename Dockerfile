FROM node:13.0.1-slim
COPY . /
CMD ["npm", "run", "test-reversibility"]
