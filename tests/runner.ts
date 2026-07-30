import { testMatcher } from './matcher.test';
import { testRiskModel } from './riskModel.test';

function runAllTests() {
  console.log('=== KrishiMitra AI Unit Testing Suite ===');
  try {
    testMatcher();
    testRiskModel();
    console.log('========================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! Ready to deploy.');
    process.exit(0);
  } catch (error: any) {
    console.error('========================================');
    console.error('❌ TESTING FAILURES ENCOUNTERED:');
    console.error(error.message || error);
    process.exit(1);
  }
}

runAllTests();
