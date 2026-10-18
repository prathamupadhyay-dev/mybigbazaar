/**
 * @file apps/api/tests/setup-test-env.js
 * @description Preloaded module that enforces isolated QA test database for test runs
 */
process.env.NODE_ENV = 'test';
console.log('[TEST_ENV] Enforced NODE_ENV=test (Isolated QA Database routing active)');
