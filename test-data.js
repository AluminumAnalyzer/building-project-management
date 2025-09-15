const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test MaterialColor data...');
  
  // 테스트 색상 데이터 생성
  const colors = [
    {
      code: 'RED001',
      name: '빨간색',
      finishType: '무광',
    },
    {
      code: 'BLUE001', 
      name: '파란색',
      finishType: '유광',
    },
    {
      code: 'GREEN001',
      name: '녹색',
      finishType: '반무광',
    }
  ];

  for (const colorData of colors) {
    // 기존 데이터 확인
    const existing = await prisma.materialColor.findUnique({
      where: { code: colorData.code }
    });

    if (!existing) {
      const color = await prisma.materialColor.create({
        data: colorData
      });
      console.log(`Created color: ${color.name} (${color.code})`);
    } else {
      console.log(`Color already exists: ${existing.name} (${existing.code})`);
    }
  }

  // 생성된 색상 데이터 확인
  const allColors = await prisma.materialColor.findMany({
    include: {
      files: {
        include: {
          file: true
        }
      }
    }
  });

  console.log('\n=== All MaterialColors ===');
  allColors.forEach(color => {
    console.log(`- ${color.name} (${color.code}): ${color.files?.length || 0} files`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
