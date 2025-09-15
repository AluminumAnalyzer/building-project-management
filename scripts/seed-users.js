const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('테스트 사용자 생성 중...');

  // 기존 사용자 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });

  const existingUser = await prisma.user.findUnique({
    where: { email: 'user@example.com' }
  });

  // 관리자 계정 생성
  if (!existingAdmin) {
    const hashedAdminPassword = await bcrypt.hash('admin123456', 12);
    await prisma.user.create({
      data: {
        name: '관리자',
        email: 'admin@example.com',
        password: hashedAdminPassword,
        role: 'ADMIN',
        active: true,
      },
    });
    console.log('✅ 관리자 계정 생성됨: admin@example.com / admin123456');
  } else {
    console.log('ℹ️ 관리자 계정이 이미 존재합니다.');
  }

  // 일반 사용자 계정 생성
  if (!existingUser) {
    const hashedUserPassword = await bcrypt.hash('user123456', 12);
    await prisma.user.create({
      data: {
        name: '사용자',
        email: 'user@example.com',
        password: hashedUserPassword,
        role: 'USER',
        active: true,
      },
    });
    console.log('✅ 사용자 계정 생성됨: user@example.com / user123456');
  } else {
    console.log('ℹ️ 사용자 계정이 이미 존재합니다.');
  }

  console.log('테스트 사용자 생성 완료!');
}

main()
  .catch((e) => {
    console.error('오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
