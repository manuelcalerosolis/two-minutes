const timeEl = document.querySelector('#time');
const statusEl = document.querySelector('#status span:last-child');
const hintEl = document.querySelector('#hint');
const rearmEl = document.querySelector('#rearm');
const permissionEl = document.querySelector('#permission');
const minutesEl = document.querySelector('#minutes');
const soundEl = document.querySelector('#sound');
const volumeEl = document.querySelector('#volume');
let settings;

function formatTime(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function render(remaining, state) {
  timeEl.textContent = formatTime(remaining);
  document.body.dataset.state = state;
  statusEl.textContent = state === 'ready' ? 'Ready' : state === 'running' ? 'In progress' : 'Complete';
  hintEl.textContent = state === 'ready' ? 'Type or click to begin' : state === 'running' ? 'Keep going' : 'Your interval is complete';
  rearmEl.hidden = state !== 'finished';
  window.twoMinutes.reportTimerStatus({ remaining, state });
}

function ring() {
  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.setValueAtTime(settings.volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.2);
  gain.connect(context.destination);
  const frequencies = settings.sound === 'soft' ? [440] : settings.sound === 'digital' ? [880, 660] : [660, 880];
  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = settings.sound === 'digital' ? 'square' : 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(context.currentTime + index * 0.18);
    oscillator.stop(context.currentTime + 0.8 + index * 0.18);
  });
}

let timer;

async function init() {
  settings = await window.twoMinutes.getSettings();
  minutesEl.value = settings.durationMinutes;
  soundEl.value = settings.sound;
  volumeEl.value = settings.volume;
  timer = new CountdownTimer({
    durationSeconds: Math.round(settings.durationMinutes * 60),
    onTick: render,
    onFinish: ring
  });
  render(timer.remaining, timer.state);
}

window.twoMinutes.onKeyboardActivity(() => timer?.start());
window.twoMinutes.onDetectorStatus(status => { permissionEl.hidden = status.available; });
window.twoMinutes.onRearmTimer(() => timer?.rearm(Math.round(settings.durationMinutes * 60)));
document.addEventListener('keydown', () => timer?.start());
document.addEventListener('mousedown', () => timer?.start());
rearmEl.addEventListener('click', () => timer.rearm(Math.round(settings.durationMinutes * 60)));
document.querySelector('#settingsToggle').addEventListener('click', () => {
  const panel = document.querySelector('#settings');
  panel.hidden = !panel.hidden;
});

async function saveSettings() {
  settings = await window.twoMinutes.setSettings({
    durationMinutes: minutesEl.value,
    sound: soundEl.value,
    volume: volumeEl.value
  });
  if (timer.state === 'ready') timer.rearm(Math.round(settings.durationMinutes * 60));
}

[minutesEl, soundEl, volumeEl].forEach(element => element.addEventListener('change', saveSettings));
document.querySelector('#minimize').addEventListener('click', window.twoMinutes.minimize);
document.querySelector('#close').addEventListener('click', window.twoMinutes.close);
init();
