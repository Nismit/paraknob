export interface NumberControlConfig {
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export class NumberControl {
  readonly element: HTMLElement;
  private bar: HTMLElement;
  private gauge: HTMLElement;
  private knob: HTMLElement;
  private labelEl: HTMLElement;
  private valueEl: HTMLElement;

  private target: object;
  private key: string;
  private min: number;
  private max: number;
  private step: number;

  private isDragging = false;
  private lastX = 0;
  private startY = 0;
  private lastDy = 0;
  private commitTimeout: number | null = null;
  private multiplierHideTimeout: number | null = null;
  private multiplierEl: HTMLElement | null = null;
  private onChange?: (value: number) => void;

  constructor(
    target: object,
    key: string,
    config: NumberControlConfig = {},
    onChange?: (value: number) => void,
  ) {
    this.target = target;
    this.key = key;
    this.onChange = onChange;

    const value = (target as Record<string, number>)[key];
    this.min = config.min ?? 0;
    this.max = config.max ?? Math.max(1, value * 2);
    this.step = config.step ?? (this.max - this.min) / 100;

    this.element = document.createElement('div');
    this.element.className = 'control control-number';

    this.bar = document.createElement('div');
    this.bar.className = 'number-bar';

    this.gauge = document.createElement('div');
    this.gauge.className = 'number-gauge';

    this.knob = document.createElement('div');
    this.knob.className = 'number-knob';

    this.labelEl = document.createElement('span');
    this.labelEl.className = 'number-label';
    this.labelEl.textContent = config.label ?? key;

    this.valueEl = document.createElement('span');
    this.valueEl.className = 'number-value';

    this.bar.appendChild(this.gauge);
    this.bar.appendChild(this.knob);
    this.bar.appendChild(this.labelEl);
    this.bar.appendChild(this.valueEl);
    this.element.appendChild(this.bar);

    this.updateDisplay();
    this.setupEvents();
  }

  private get value(): number {
    return (this.target as Record<string, number>)[this.key];
  }

  private set value(v: number) {
    (this.target as Record<string, number>)[this.key] = v;
  }

  private updateDisplay(): void {
    const v = this.value;
    this.valueEl.textContent = v.toFixed(2);

    const ratio = (v - this.min) / (this.max - this.min);
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    this.gauge.style.width = `${clampedRatio * 100}%`;
    this.knob.style.left = `calc(${clampedRatio * 100}% - 4px)`;
  }

  private scheduleCommit(): void {
    if (this.commitTimeout !== null) {
      clearTimeout(this.commitTimeout);
    }
    this.commitTimeout = window.setTimeout(() => {
      this.onChange?.(this.value);
      this.commitTimeout = null;
    }, 300);
  }

  private showMultiplier(multiplier: number): void {
    if (!this.multiplierEl) {
      this.multiplierEl = document.createElement('div');
      this.multiplierEl.className = 'number-multiplier';
      this.multiplierEl.style.cssText =
        'position:fixed;pointer-events:none;background:rgba(0,0,0,0.8);color:#fff;padding:4px 8px;border-radius:4px;font-family:system-ui,sans-serif;font-size:12px;z-index:10000;';
      document.body.appendChild(this.multiplierEl);
    }

    const text = multiplier < 1 ? `×${multiplier.toFixed(2)}` : `×${multiplier.toFixed(1)}`;
    this.multiplierEl.textContent = text;
    this.multiplierEl.style.display = 'block';

    const barRect = this.bar.getBoundingClientRect();
    const elWidth = this.multiplierEl.offsetWidth;
    const elHeight = this.multiplierEl.offsetHeight;
    const margin = 8;

    let x: number;
    let y: number;

    // Horizontal: prefer right of bar, fallback to left
    if (barRect.right + margin + elWidth <= window.innerWidth) {
      x = barRect.right + margin;
    } else {
      x = barRect.left - elWidth - margin;
    }

    // Vertical: center align with bar, adjust if out of bounds
    y = barRect.top + (barRect.height - elHeight) / 2;
    if (y < 0) {
      y = margin;
    } else if (y + elHeight > window.innerHeight) {
      y = window.innerHeight - elHeight - margin;
    }

    this.multiplierEl.style.left = `${x}px`;
    this.multiplierEl.style.top = `${y}px`;
  }

  private hideMultiplier(): void {
    if (this.multiplierEl) {
      this.multiplierEl.style.display = 'none';
    }
  }

  private scheduleHideMultiplier(): void {
    if (this.multiplierHideTimeout !== null) {
      clearTimeout(this.multiplierHideTimeout);
    }
    this.multiplierHideTimeout = window.setTimeout(() => {
      this.hideMultiplier();
      this.multiplierHideTimeout = null;
    }, 300);
  }

  private setupEvents(): void {
    this.bar.addEventListener('pointerdown', this.onPointerDown);
    this.bar.addEventListener('dblclick', this.onDoubleClick);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;

    this.isDragging = true;
    this.lastX = e.clientX;
    this.startY = e.clientY;
    this.lastDy = 0;

    this.bar.setPointerCapture(e.pointerId);
    this.bar.addEventListener('pointermove', this.onPointerMove);
    this.bar.addEventListener('pointerup', this.onPointerUp);
    this.bar.addEventListener('pointercancel', this.onPointerUp);
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDragging) return;

    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.startY;

    // Calculate multiplier: up = precise (0.1x at -100px), down = fast (10x at +100px)
    const dyNormalized = Math.max(-100, Math.min(100, dy)) / 100;
    const multiplier = Math.pow(10, dyNormalized);

    // Show multiplier indicator when vertical movement changes
    if (Math.abs(dy - this.lastDy) > 2) {
      this.showMultiplier(multiplier);
      this.scheduleHideMultiplier();
      this.lastDy = dy;
    }

    const baseSensitivity = (this.max - this.min) / this.bar.offsetWidth;
    let newValue = this.value + dx * baseSensitivity * multiplier;

    newValue = Math.round(newValue / this.step) * this.step;
    newValue = Math.max(this.min, Math.min(this.max, newValue));

    this.value = newValue;
    this.lastX = e.clientX;
    this.updateDisplay();
    this.scheduleCommit();
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.lastDy = 0;
    this.hideMultiplier();
    if (this.multiplierHideTimeout !== null) {
      clearTimeout(this.multiplierHideTimeout);
      this.multiplierHideTimeout = null;
    }
    this.bar.releasePointerCapture(e.pointerId);
    this.bar.removeEventListener('pointermove', this.onPointerMove);
    this.bar.removeEventListener('pointerup', this.onPointerUp);
    this.bar.removeEventListener('pointercancel', this.onPointerUp);
  };

  private onDoubleClick = (): void => {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'number-input';
    input.value = this.value.toString();
    input.min = this.min.toString();
    input.max = this.max.toString();
    input.step = this.step.toString();

    this.valueEl.textContent = '';
    this.valueEl.appendChild(input);
    input.focus();
    input.select();

    const commit = () => {
      const newValue = Math.max(
        this.min,
        Math.min(this.max, parseFloat(input.value) || this.value),
      );
      this.value = newValue;
      this.updateDisplay();
      this.onChange?.(this.value);
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        this.updateDisplay();
      }
    });
  };

  dispose(): void {
    if (this.commitTimeout !== null) {
      clearTimeout(this.commitTimeout);
    }
    if (this.multiplierHideTimeout !== null) {
      clearTimeout(this.multiplierHideTimeout);
    }
    if (this.multiplierEl) {
      this.multiplierEl.remove();
      this.multiplierEl = null;
    }
    this.bar.removeEventListener('pointerdown', this.onPointerDown);
    this.bar.removeEventListener('dblclick', this.onDoubleClick);
  }
}
