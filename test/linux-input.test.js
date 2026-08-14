const test = require('node:test');
const assert = require('node:assert/strict');
const { activityEventPaths, isKeyDownEvent } = require('../src/platform/linux-input');

test('discovers event handlers for keyboard and pointer devices', () => {
  const proc = `I: Bus=0011 Vendor=0001 Product=0001 Version=ab41\nN: Name="Keyboard"\nH: Handlers=sysrq kbd event3 leds\n\nI: Bus=0003\nN: Name="Mouse"\nH: Handlers=mouse0 event5\n\nI: Bus=0003\nN: Name="Audio"\nH: Handlers=event8`;
  assert.deepEqual(activityEventPaths(proc), ['/dev/input/event3', '/dev/input/event5']);
});

test('recognizes a key or button press without exposing its code', () => {
  const event = Buffer.alloc(24);
  event.writeUInt16LE(1, 16);
  event.writeUInt16LE(30, 18);
  event.writeInt32LE(1, 20);
  assert.equal(isKeyDownEvent(event), true);
  event.writeInt32LE(0, 20);
  assert.equal(isKeyDownEvent(event), false);
});
