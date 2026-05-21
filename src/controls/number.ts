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
  private step: number | null;

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  private dirAverageX = 0;
  private dirAverageY = 0;
  private speedMultiplier = 1;
  private rawValue = 0;
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
    this.step = config.step ?? null;

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

  private updateDisplay(useRawValue = false): void {
    const displayValue = this.value;
    const gaugeValue = useRawValue ? this.rawValue : displayValue;

    // Display stepped value
    if (this.step !== null && this.step >= 1) {
      this.valueEl.textContent = displayValue.toFixed(0);
    } else {
      this.valueEl.textContent = displayValue.toFixed(2);
    }

    // Gauge uses raw value for smooth animation
    const ratio = (gaugeValue - this.min) / (this.max - this.min);
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

    const text =
      multiplier < 1
        ? `×${multiplier.toFixed(2)}`
        : `×${multiplier.toFixed(1)}`;
    this.multiplierEl.textContent = text;
    this.multiplierEl.style.display = 'block';

    const barRect = this.bar.getBoundingClientRect();
    const elWidth = this.multiplierEl.offsetWidth;
    const elHeight = this.multiplierEl.offsetHeight;
    const margin = 8;

    let x: number;
    let y: number;

    if (barRect.right + margin + elWidth <= window.innerWidth) {
      x = barRect.right + margin;
    } else {
      x = barRect.left - elWidth - margin;
    }

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
    this.lastY = e.clientY;
    this.dirAverageX = 1;
    this.dirAverageY = 0;
    this.speedMultiplier = 1;
    this.rawValue = this.value;

    this.bar.setPointerCapture(e.pointerId);
    this.bar.addEventListener('pointermove', this.onPointerMove);
    this.bar.addEventListener('pointerup', this.onPointerUp);
    this.bar.addEventListener('pointercancel', this.onPointerUp);
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDragging) return;

    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;

    // Update direction average (smoothed over time)
    const lerpFactor = 0.15;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    this.dirAverageX =
      this.dirAverageX + (absDx - this.dirAverageX) * lerpFactor;
    this.dirAverageY =
      this.dirAverageY + (absDy - this.dirAverageY) * lerpFactor;

    // Normalize direction average
    const dirMag = Math.sqrt(this.dirAverageX ** 2 + this.dirAverageY ** 2);
    const normX = dirMag > 0.001 ? this.dirAverageX / dirMag : 1;

    // offsetWeight: 1 when horizontal, 0 when vertical (smoothstep)
    const t = Math.max(0, Math.min(1, (normX - 0.4) / 0.2));
    const offsetWeight = t * t * (3 - 2 * t);

    // Adjust speed multiplier based on vertical movement (exponential)
    // When dragging horizontally (offsetWeight≈1), speed changes slowly
    // When dragging vertically (offsetWeight≈0), speed changes quickly
    const speedLerp = 1 - offsetWeight;
    this.speedMultiplier = Math.max(
      0.01,
      Math.min(100, this.speedMultiplier * 0.98 ** (dy * speedLerp)),
    );

    // Show multiplier when not at default speed
    if (Math.abs(this.speedMultiplier - 1) > 0.05) {
      this.showMultiplier(this.speedMultiplier);
      this.scheduleHideMultiplier();
    }

    // Calculate value change
    const baseSpeed = (this.max - this.min) / this.bar.offsetWidth;
    const delta = dx * baseSpeed * this.speedMultiplier * offsetWeight;

    // Update raw value (continuous, for smooth gauge)
    this.rawValue = Math.max(
      this.min,
      Math.min(this.max, this.rawValue + delta),
    );

    // Stepped value for display and target
    let steppedValue = this.rawValue;
    if (this.step !== null) {
      steppedValue = Math.round(this.rawValue / this.step) * this.step;
      steppedValue = Math.max(this.min, Math.min(this.max, steppedValue));
    }

    this.value = steppedValue;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.updateDisplay(true);
    this.scheduleCommit();
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.speedMultiplier = 1;
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
    input.step = this.step?.toString() ?? 'any';

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
