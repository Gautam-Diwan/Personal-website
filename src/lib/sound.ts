/**
 * Tiny synthesized UI sounds (Web Audio API, no audio files).
 * Sounds only play in response to a click, and can be muted from the navbar.
 */

const KEY = "sound";
let ctx: AudioContext | null = null;
const listeners = new Set<(on: boolean) => void>();

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l(on));
}

export function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** One enveloped oscillator note. */
function tone(
  freqFrom: number,
  freqTo: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  delay = 0,
) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, t0);
  osc.frequency.exponentialRampToValueAtTime(freqTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Bubbly pop for nav clicks; `pitch` shifts it so each item sounds a little different. */
export function playPop(pitch = 1) {
  if (!soundEnabled()) return;
  tone(420 * pitch, 880 * pitch, 0.09, "sine", 0.18);
  tone(1300 * pitch, 1700 * pitch, 0.04, "triangle", 0.04, 0.005);
}

/** Two-step click like a light switch: up for on, down for off. */
export function playSwitch(on: boolean) {
  if (!soundEnabled()) return;
  const [a, b] = on ? [520, 780] : [700, 420];
  tone(a, a * 0.98, 0.05, "square", 0.05);
  tone(b, b * 0.98, 0.06, "square", 0.045, 0.06);
}

/** Small confirmation blip, played when sound is switched back on. */
export function playBlip() {
  tone(660, 990, 0.07, "sine", 0.14);
  tone(990, 1320, 0.08, "sine", 0.1, 0.07);
}
