# Stage 1: build the web SPA
FROM node:20-slim AS builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# Stage 2: run the FastAPI app
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY mox/ ./mox/
COPY demo_target/ ./demo_target/
COPY --from=builder /app/web/dist ./web/dist

ENV PORT=8000
EXPOSE 8000
CMD uvicorn "mox.api:create_app" --factory --host 0.0.0.0 --port $PORT
