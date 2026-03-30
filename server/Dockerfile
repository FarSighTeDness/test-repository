FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

ENV PORT=5001

EXPOSE 5001

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=6 \
	CMD node --input-type=module -e "import http from 'node:http'; const port = Number(process.env.PORT || 5001); const req = http.get({ host: '127.0.0.1', port, path: '/' }, (res) => process.exit(res.statusCode < 500 ? 0 : 1)); req.on('error', () => process.exit(1)); req.setTimeout(2000, () => { req.destroy(); process.exit(1); });"

CMD ["node", "src/server.js"]
