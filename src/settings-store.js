const fs = require('node:fs');
const path = require('node:path');

const DEFAULTS = Object.freeze({ durationMinutes: 2, sound: 'bell', volume: 0.7 });

function sanitize(value = {}) {
  const durationMinutes = Math.min(60, Math.max(0.25, Number(value.durationMinutes) || 2));
  const volume = Math.min(1, Math.max(0, Number(value.volume) || 0));
  const sound = ['bell', 'soft', 'digital'].includes(value.sound) ? value.sound : 'bell';
  return { durationMinutes, sound, volume };
}

class SettingsStore {
  constructor(getDirectory) {
    this.getDirectory = getDirectory;
  }

  get file() {
    return path.join(this.getDirectory(), 'settings.json');
  }

  get() {
    try {
      return sanitize(JSON.parse(fs.readFileSync(this.file, 'utf8')));
    } catch {
      return { ...DEFAULTS };
    }
  }

  set(value) {
    const clean = sanitize(value);
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(clean, null, 2), { mode: 0o600 });
    return clean;
  }
}

module.exports = { SettingsStore, sanitize, DEFAULTS };

