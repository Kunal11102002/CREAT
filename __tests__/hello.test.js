{
  "scripts": {
    "test": "vitest"
  }
} 

const { test, expect } = require('vitest');

test('hello world', () => {
  expect('Hello, World!').toBe('Hello, World!');
});