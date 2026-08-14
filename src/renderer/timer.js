class CountdownTimer {
  constructor({ durationSeconds, onTick, onFinish, now = () => Date.now() }) {
    this.durationSeconds = durationSeconds;
    this.onTick = onTick;
    this.onFinish = onFinish;
    this.now = now;
    this.state = 'ready';
    this.remaining = durationSeconds;
    this.interval = null;
  }

  start() {
    if (this.state !== 'ready') return false;
    this.state = 'running';
    this.deadline = this.now() + this.durationSeconds * 1000;
    this.onTick(this.remaining, this.state);
    this.interval = setInterval(() => this.tick(), 100);
    return true;
  }

  tick() {
    const next = Math.max(0, Math.ceil((this.deadline - this.now()) / 1000));
    if (next !== this.remaining) {
      this.remaining = next;
      this.onTick(this.remaining, this.state);
    }
    if (next === 0) this.finish();
  }

  finish() {
    if (this.state !== 'running') return;
    clearInterval(this.interval);
    this.interval = null;
    this.state = 'finished';
    this.onTick(0, this.state);
    this.onFinish();
  }

  rearm(durationSeconds = this.durationSeconds) {
    clearInterval(this.interval);
    this.interval = null;
    this.durationSeconds = durationSeconds;
    this.remaining = durationSeconds;
    this.state = 'ready';
    this.onTick(this.remaining, this.state);
  }
}

if (typeof module !== 'undefined') module.exports = { CountdownTimer };
else window.CountdownTimer = CountdownTimer;

