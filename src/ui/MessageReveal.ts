import { TIMING } from '../config/constants';

/** After the apology, a few more lines take turns in the same quiet spot; the last one stays. */
const EXTRA_LINES = [
  'Every one of these opened because of you.',
  'You are my favourite part of every day.',
  'I never want to be the reason you\u2019re sad.',
  'Forgive me? \u2764\uFE0F',
];

/**
 * The apology. Three lines, in order, with time between them, then the extras:
 *   GORGII❤️
 *   I'm sorry, Gorgii❤️
 *   I wanted to say it properly, so I made you these.
 */
export class MessageReveal {
  private name = document.getElementById('msg-name')!;
  private sorry = document.getElementById('msg-sorry')!;
  private hand = document.getElementById('msg-hand')!;
  private extra = document.getElementById('msg-extra')!;
  private extraIndex = -1;
  private root = document.getElementById('message')!;
  private time = 0;
  private running = false;
  private finished = false;
  onFinal: (() => void) | null = null;

  start() { this.running = true; this.finished = false; this.time = 0; this.root.classList.add('is-active'); }

  update(dt: number) {
    if (!this.running) return;
    this.time += dt;
    const r = TIMING.reveal;
    this.name.classList.toggle('is-visible', this.time > r.nameAt);
    this.sorry.classList.toggle('is-visible', this.time > r.sorryAt);
    this.hand.classList.toggle('is-visible', this.time > r.handAt);
    this.updateExtra();
    if (!this.finished && this.time > r.finalAt) { this.finished = true; this.onFinal?.(); }
  }

  /** Cycle the extra lines: each fades in, holds, fades out; the last one stays. */
  private updateExtra() {
    const r = TIMING.reveal;
    const t = this.time - r.extraAt;
    if (t < 0) return;
    const slot = Math.min(EXTRA_LINES.length - 1, Math.floor(t / r.extraHold));
    const within = t - slot * r.extraHold;
    const isLast = slot === EXTRA_LINES.length - 1;
    if (slot !== this.extraIndex) {
      this.extraIndex = slot;
      this.extra.textContent = EXTRA_LINES[slot];
    }
    // fade out during the final second of each hold (except the last line)
    const visible = isLast || within < r.extraHold - 1.4;
    this.extra.classList.toggle('is-visible', visible);
  }

  get progress() { return this.running ? this.time : 0; }

  reset() {
    this.running = false; this.finished = false; this.time = 0;
    this.root.classList.remove('is-active');
    this.extraIndex = -1;
    this.extra.textContent = '';
    for (const el of [this.name, this.sorry, this.hand, this.extra]) el.classList.remove('is-visible');
  }
}
