const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitize } = require('../src/settings-store');

test('sanitizes settings', () => {
  assert.deepEqual(sanitize({ durationMinutes: 200, sound: 'unknown', volume: -1 }), {
    durationMinutes: 60,
    sound: 'bell',
    volume: 0
  });
});
