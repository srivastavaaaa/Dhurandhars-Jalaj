import { evaluateSchemeEligibility } from '../lib/schemes/matcher';

export function testMatcher() {
  console.log('Running Scheme Matcher tests...');

  // Test 1: Match central scheme with no specific state or category constraints, but max land size
  const rules1 = JSON.stringify({
    maxLandAcres: 5.0,
    states: [],
    categories: []
  });

  const farmer1 = {
    state: 'Maharashtra',
    landSizeAcres: 2.5,
    category: 'General'
  };

  const res1 = evaluateSchemeEligibility(rules1, farmer1);
  if (!res1.eligible || res1.score !== 100) {
    throw new Error(`Test 1 Failed: Expected eligible and 100 score, got ${res1.eligible} and ${res1.score}`);
  }

  // Test 2: Mismatch land size threshold
  const farmer2 = {
    state: 'Maharashtra',
    landSizeAcres: 7.5,
    category: 'General'
  };

  const res2 = evaluateSchemeEligibility(rules1, farmer2);
  if (res2.eligible) {
    throw new Error(`Test 2 Failed: Expected ineligible due to land size, got eligible.`);
  }

  // Test 3: Match state specific scheme
  const rules3 = JSON.stringify({
    maxLandAcres: 5.0,
    states: ['Andhra Pradesh'],
    categories: ['SC', 'ST', 'OBC']
  });

  const farmer3 = {
    state: 'Andhra Pradesh',
    landSizeAcres: 3.0,
    category: 'OBC'
  };

  const res3 = evaluateSchemeEligibility(rules3, farmer3);
  if (!res3.eligible || res3.score !== 100) {
    throw new Error(`Test 3 Failed: Expected eligible 100, got ${res3.eligible} and ${res3.score}`);
  }

  // Test 4: Mismatch state specific scheme due to state and category mismatch
  const farmer4 = {
    state: 'Maharashtra',
    landSizeAcres: 3.0,
    category: 'General'
  };

  const res4 = evaluateSchemeEligibility(rules3, farmer4);
  // rules: land size (matches), state (mismatches), category (mismatches) -> score is 33% (1/3)
  if (res4.eligible || res4.score > 40) {
    throw new Error(`Test 4 Failed: Expected ineligible with low score, got eligible: ${res4.eligible}, score: ${res4.score}`);
  }

  console.log('✅ Scheme Matcher tests passed successfully!');
}
