#!/usr/bin/env node

/**
 * Script test API cho Bizfly Cloud Cost Calculator
 * Chạy: node test-api.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Định nghĩa các test cases
const testCases = [
  {
    name: 'Cloud Server - Intel Gen 2, Basic, 4 vCPU, 8 GB RAM, 10 GB SSD',
    request: {
      billingCycle: 1,
      discountPercent: 0,
      items: [
        {
          id: 'CloudServer',
          quantity: 1,
          options: {
            chipModel: 'intelGen2',
            billingMethod: 'subscription',
            tier: 'basic',
            cpuCores: 4,
            ramGb: 8,
            diskType: 'ssd',
            diskSize: 10
          }
        }
      ]
    },
    expectedSubtotal: 715820
  },
  {
    name: 'Cloud Server - Intel Gen 2, Premium, 4 vCPU, 8 GB RAM, 10 GB SSD + 1x 120GB SSD',
    request: {
      billingCycle: 1,
      discountPercent: 0,
      items: [
        {
          id: 'CloudServer',
          quantity: 1,
          options: {
            chipModel: 'intelGen2',
            billingMethod: 'subscription',
            tier: 'premium',
            cpuCores: 4,
            ramGb: 8,
            diskType: 'ssd',
            diskSize: 10,
            externalDisks: [
              {
                quantity: 1,
                diskType: 'ssd',
                diskSize: 120
              }
            ]
          }
        }
      ]
    },
    expectedSubtotal: 2090451
  },
  {
    name: 'Cloud VPS - 2 vCPU, 8 GB RAM, 40 GB SSD, Quantity: 2',
    request: {
      billingCycle: 1,
      discountPercent: 0,
      items: [
        {
          id: 'CloudVps',
          quantity: 2,
          options: {
            packageId: 7
          }
        }
      ]
    },
    expectedSubtotal: 680000
  },
  {
    name: 'Business Email - Package ID 10, 4000 GB, 10000 emails/day, Quantity: 1',
    request: {
      billingCycle: 1,
      discountPercent: 0,
      items: [
        {
          id: 'BusinessEmail',
          quantity: 1,
          options: {
            packageId: 10  // ID 10: 4000 GB, 10000 emails/day, price: 7100000
          }
        }
      ]
    },
    expectedSubtotal: 7100000
  },
  {
    name: 'Business Email - Package ID 10 (lần 2)',
    request: {
      billingCycle: 1,
      discountPercent: 0,
      items: [
        {
          id: 'BusinessEmail',
          quantity: 1,
          options: {
            packageId: 10
          }
        }
      ]
    },
    expectedSubtotal: 7100000
  },
  {
    name: 'CDN - Datatransfer 334455 GB/tháng',
    request: {
      billingCycle: 1,
      discountPercent: 0,
      items: [
        {
          id: 'CDN',
          quantity: 1,
          options: {
            dataTransfer: 334455
          }
        }
      ]
    },
    expectedSubtotal: 117059250
  }
];

// Hàm gọi API
async function callAPI(request) {
  try {
    const response = await fetch(`${API_URL}/api/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}

// Hàm format số tiền
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

// Hàm so sánh với tolerance
function isEqual(actual, expected, tolerance = 100) {
  return Math.abs(actual - expected) <= tolerance;
}

// Hàm chạy test
async function runTest(testCase, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`${'='.repeat(80)}`);
  console.log('Request:', JSON.stringify(testCase.request, null, 2));

  try {
    const response = await callAPI(testCase.request);
    
    console.log('\nResponse:');
    console.log(`  Subtotal: ${formatCurrency(response.subtotal)} VNĐ`);
    console.log(`  VAT: ${formatCurrency(response.vat)} VNĐ`);
    console.log(`  Discount: ${formatCurrency(response.discountAmount)} VNĐ`);
    console.log(`  Grand Total: ${formatCurrency(response.grandTotal)} VNĐ`);
    
    if (response.calculatedItems && response.calculatedItems.length > 0) {
      console.log('\n  Calculated Items:');
      response.calculatedItems.forEach((item, idx) => {
        console.log(`    ${idx + 1}. ${item.service} (Qty: ${item.quantity})`);
        console.log(`       Price per unit: ${formatCurrency(item.pricePerUnit)} VNĐ`);
        console.log(`       Total price: ${formatCurrency(item.totalPrice)} VNĐ`);
      });
    }

    // So sánh với giá trị kỳ vọng
    const actualSubtotal = response.subtotal;
    const expectedSubtotal = testCase.expectedSubtotal;
    const match = isEqual(actualSubtotal, expectedSubtotal);

    console.log(`\n  Expected Subtotal: ${formatCurrency(expectedSubtotal)} VNĐ`);
    console.log(`  Actual Subtotal:   ${formatCurrency(actualSubtotal)} VNĐ`);
    console.log(`  Difference:        ${formatCurrency(Math.abs(actualSubtotal - expectedSubtotal))} VNĐ`);
    
    if (match) {
      console.log(`\n✅ PASS: Subtotal khớp với giá trị kỳ vọng (tolerance: ±${formatCurrency(100)} VNĐ)`);
      return { success: true, testCase: testCase.name };
    } else {
      console.log(`\n❌ FAIL: Subtotal không khớp với giá trị kỳ vọng`);
      return { success: false, testCase: testCase.name, actual: actualSubtotal, expected: expectedSubtotal };
    }
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    return { success: false, testCase: testCase.name, error: error.message };
  }
}

// Hàm chạy tất cả tests
async function runAllTests() {
  console.log('🚀 Bắt đầu chạy test API cho Bizfly Cloud Cost Calculator');
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`📋 Tổng số test cases: ${testCases.length}`);

  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const result = await runTest(testCases[i], i);
    results.push(result);
    
    // Delay nhỏ giữa các requests
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Tóm tắt kết quả
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 TÓM TẮT KẾT QUẢ');
  console.log(`${'='.repeat(80)}`);
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Failed: ${failed}/${testCases.length}`);
  
  if (failed > 0) {
    console.log('\nChi tiết các test case thất bại:');
    results.forEach((result, idx) => {
      if (!result.success) {
        console.log(`\n  ${idx + 1}. ${result.testCase}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        } else {
          console.log(`     Expected: ${formatCurrency(result.expected)} VNĐ`);
          console.log(`     Actual:   ${formatCurrency(result.actual)} VNĐ`);
        }
      }
    });
  }

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Chạy tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

