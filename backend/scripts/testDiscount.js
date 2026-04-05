#!/usr/bin/env node
/**
 * Debug Discount API
 * Test discount validation endpoint
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const testCases = [
  {
    name: 'Valid discount - WELCOME20',
    code: 'WELCOME20',
    orderAmount: 100000,
    expectSuccess: true,
  },
  {
    name: 'Invalid code',
    code: 'INVALID123',
    orderAmount: 100000,
    expectSuccess: false,
  },
  {
    name: 'Min order amount too low',
    code: 'WELCOME20',
    orderAmount: 10000,
    expectSuccess: false,
  },
  {
    name: 'Fixed discount - SAVE50K',
    code: 'SAVE50K',
    orderAmount: 250000,
    expectSuccess: true,
  },
];

async function testDiscount() {
  console.log('\n🔧 Testing Discount API\n');

  for (const test of testCases) {
    try {
      console.log(`📝 Test: ${test.name}`);
      console.log(`   Code: ${test.code}, Amount: ${test.orderAmount.toLocaleString()}đ`);

      const response = await axios.post(`${API_BASE}/discount/validate`, {
        code: test.code,
        orderAmount: test.orderAmount,
      });

      if (test.expectSuccess) {
        if (response.status === 200) {
          const data = response.data?.data || response.data;
          console.log(`   ✅ SUCCESS`);
          console.log(`      Type: ${data.type}`);
          console.log(`      Value: ${data.value}`);
          console.log(`      Discount Amount: ${data.discountAmount?.toLocaleString() || 0}đ`);
        } else {
          console.log(`   ❌ FAILED - Expected success but got status ${response.status}`);
        }
      }
    } catch (err) {
      const statusCode = err.response?.status;
      const errorMsg = err.response?.data?.message || err.message;

      if (!test.expectSuccess) {
        console.log(`   ✅ EXPECTED ERROR: ${errorMsg}`);
      } else {
        console.log(`   ❌ ERROR (${statusCode}): ${errorMsg}`);
      }
    }

    console.log('');
  }

  console.log('✅ All tests completed!');
}

// Run tests
testDiscount().catch(console.error);
