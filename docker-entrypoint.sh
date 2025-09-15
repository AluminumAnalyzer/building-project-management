#!/bin/sh

# Prisma 마이그레이션 실행
echo "Running database migrations..."
npx prisma migrate deploy

# 개발 환경이 아닐 경우에만 시드 데이터 추가 
if [ "$NODE_ENV" = "development" ]; then
  echo "Running database seed in development mode..."
  npx prisma db seed
fi

# Next.js 앱 실행
echo "Starting Next.js application..."
exec node server.js
