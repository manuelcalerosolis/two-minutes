const fs = require('node:fs');
const { EventEmitter } = require('node:events');

const EVENT_SIZE_X64 = 24;
const EV_KEY = 0x01;
const KEY_DOWN = 1;

function activityEventPaths(procText) {
  return procText
    .split(/\n\s*\n/)
    .filter(block => /^H:.*\b(kbd|mouse\d*)\b/m.test(block))
    .flatMap(block => {
      const match = block.match(/^H: Handlers=(.+)$/m);
      return match ? match[1].split(/\s+/).filter(x => /^event\d+$/.test(x)) : [];
    })
    .map(handler => `/dev/input/${handler}`);
}

function isKeyDownEvent(buffer, offset = 0) {
  if (buffer.length - offset < EVENT_SIZE_X64) return false;
  const type = buffer.readUInt16LE(offset + 16);
  const value = buffer.readInt32LE(offset + 20);
  return type === EV_KEY && value === KEY_DOWN;
}

class InputActivityDetector extends EventEmitter {
  constructor(options = {}) {
    super();
    this.fs = options.fs || fs;
    this.streams = [];
  }

  start() {
    if (process.platform !== 'linux') {
      this.emit('status', { available: false, reason: 'unsupported-platform' });
      return;
    }

    let paths = [];
    try {
      paths = activityEventPaths(this.fs.readFileSync('/proc/bus/input/devices', 'utf8'));
    } catch (error) {
      this.emit('status', { available: false, reason: 'device-discovery-failed' });
      return;
    }

    for (const devicePath of [...new Set(paths)]) {
      try {
        const fd = this.fs.openSync(devicePath, 'r');
        const stream = this.fs.createReadStream(null, { fd, autoClose: true, highWaterMark: EVENT_SIZE_X64 * 8 });
        let remainder = Buffer.alloc(0);
        stream.on('data', chunk => {
          const data = Buffer.concat([remainder, chunk]);
          let offset = 0;
          while (data.length - offset >= EVENT_SIZE_X64) {
            // Deliberately ignore the key or button code at bytes 18–19.
            if (isKeyDownEvent(data, offset)) this.emit('activity');
            offset += EVENT_SIZE_X64;
          }
          remainder = data.subarray(offset);
        });
        stream.on('error', () => {});
        this.streams.push(stream);
      } catch {
        // Continue: another keyboard device may still be readable.
      }
    }

    this.emit('status', this.streams.length
      ? { available: true, devices: this.streams.length }
      : { available: false, reason: 'permission-required' });
  }

  stop() {
    for (const stream of this.streams) stream.destroy();
    this.streams = [];
  }
}

module.exports = { InputActivityDetector, activityEventPaths, isKeyDownEvent };
