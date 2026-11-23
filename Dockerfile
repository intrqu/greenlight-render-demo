FROM node:22-alpine
RUN apk add --no-cache nginx
WORKDIR /app/reflector
COPY reflector/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY reflector/ ./
COPY web/ /app/web/
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /app/start.sh
EXPOSE 10000
CMD ["sh", "/app/start.sh"]
