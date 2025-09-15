/**
 * Material Management API 테스트 스크립트
 * 
 * 사용법:
 * 1. 서버 실행: yarn dev
 * 2. 테스트 실행: node test-material-apis.js
 */

const BASE_URL = 'http://localhost:3000';

// 테스트용 인증 토큰 (실제 환경에서는 로그인 후 받은 토큰 사용)
const AUTH_TOKEN = 'your-auth-token-here';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`
};

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));

    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error testing ${method} ${endpoint}:`, error);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Material Management API 테스트 시작\n');

  // 1. Material Colors API 테스트
  console.log('=== Material Colors API ===');
  await testAPI('/api/material-colors');
  
  const colorData = {
    code: 'WHITE',
    name: '화이트',
    finishType: '아노다이징'
  };
  const colorResult = await testAPI('/api/material-colors', 'POST', colorData);
  
  if (colorResult.data?.id) {
    await testAPI(`/api/material-colors/${colorResult.data.id}`);
    await testAPI(`/api/material-colors/${colorResult.data.id}`, 'PUT', {
      name: '화이트 (수정됨)'
    });
  }

  // 2. Material Stock API 테스트
  console.log('\n=== Material Stock API ===');
  await testAPI('/api/material-stock');
  
  // 3. Material Transactions API 테스트
  console.log('\n=== Material Transactions API ===');
  await testAPI('/api/material-transactions');
  
  // 4. Summary API 테스트
  console.log('\n=== Summary API ===');
  await testAPI('/api/materials/summary');
  
  // 5. Inventory API 테스트
  console.log('\n=== Inventory API ===');
  await testAPI('/api/materials/inventory');
  await testAPI('/api/materials/inventory?groupBy=warehouse');
  await testAPI('/api/materials/inventory?groupBy=category');
  
  // 6. Transaction Report API 테스트
  console.log('\n=== Transaction Report API ===');
  await testAPI('/api/material-transactions/report');
  await testAPI('/api/material-transactions/report?groupBy=material&period=monthly');
  
  // 7. Suppliers API 테스트
  console.log('\n=== Suppliers API ===');
  await testAPI('/api/suppliers');
  
  const supplierData = {
    code: 'SUP001',
    name: '테스트 공급업체',
    type: 'SUPPLIER',
    address: '서울시 강남구',
    contactPerson: '홍길동',
    phone: '02-1234-5678',
    email: 'test@supplier.com'
  };
  const supplierResult = await testAPI('/api/suppliers', 'POST', supplierData);
  
  if (supplierResult.data?.id) {
    await testAPI(`/api/suppliers/${supplierResult.data.id}`);
  }

  // 8. Warehouses API 테스트
  console.log('\n=== Warehouses API ===');
  await testAPI('/api/warehouses');
  
  const warehouseData = {
    code: 'WH001',
    name: '메인 창고',
    location: '서울시 강서구',
    purpose: '일반 자재 보관'
  };
  const warehouseResult = await testAPI('/api/warehouses', 'POST', warehouseData);
  
  if (warehouseResult.data?.id) {
    await testAPI(`/api/warehouses/${warehouseResult.data.id}`);
  }

  // 9. Material Bases API 테스트
  console.log('\n=== Material Bases API ===');
  await testAPI('/api/material-bases');
  
  const materialBaseData = {
    code: 'ALU001',
    name: '알루미늄 프로파일',
    category: '구조재',
    specification: '50x50x3T',
    unit: 'M',
    basePrice: 15000,
    description: '일반 구조용 알루미늄 프로파일'
  };
  const materialBaseResult = await testAPI('/api/material-bases', 'POST', materialBaseData);
  
  if (materialBaseResult.data?.id) {
    await testAPI(`/api/material-bases/${materialBaseResult.data.id}`);
  }

  // 10. Materials API 테스트
  console.log('\n=== Materials API ===');
  await testAPI('/api/materials');

  console.log('\n✅ 모든 API 테스트 완료');
}

// 테스트 실행
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };
