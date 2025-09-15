// 색상 테스트 데이터 시드 스크립트
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const colors = [
  {
    code: '#FF0000',
    name: '빨강',
    finishType: '무광'
  },
  {
    code: '#00FF00',
    name: '초록',
    finishType: '유광'
  },
  {
    code: '#0000FF',
    name: '파랑',
    finishType: '반광'
  },
  {
    code: '#FFFF00',
    name: '노랑',
    finishType: '무광'
  },
  {
    code: '#FF00FF', 
    name: '자주',
    finishType: '유광'
  },
  {
    code: '#00FFFF',
    name: '청록',
    finishType: '샌딩'
  },
  {
    code: '#FFA500',
    name: '주황',
    finishType: '무광'
  },
  {
    code: '#800080',
    name: '보라',
    finishType: '유광'
  }
];

async function seedColors() {
  try {
    console.log('색상 데이터 시딩 시작...');
    
    for (const color of colors) {
      const existing = await prisma.materialColor.findUnique({
        where: { code: color.code }
      });
      
      if (!existing) {
        await prisma.materialColor.create({
          data: color
        });
        console.log(`${color.name} (${color.code}) 추가 완료`);
      } else {
        console.log(`${color.name} (${color.code}) 이미 존재함`);
      }
    }
    
    console.log('색상 데이터 시딩 완료!');
  } catch (error) {
    console.error('시딩 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedColors();
