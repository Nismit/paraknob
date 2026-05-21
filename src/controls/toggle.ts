export interface ToggleControlConfig {
  toggle: true;
  label?: string;
  onLabel?: string;
  offLabel?: string;
}

export class ToggleControl {
  readonly element: HTMLElement;
  private target: object;
  private key: string;
  private trackEl: HTMLElement;
  private onChange?: (value: number) => void;
  private onClick: () => void;

  constructor(
    target: object,
    key: string,
    config: ToggleControlConfig,
    onChange?: (value: number) => void,
  ) {
    this.target = target;
    this.key = key;
    this.onChange = onChange;

    const onLabel = config.onLabel ?? '1';
    const offLabel = config.offLabel ?? '0';

    this.element = document.createElement('div');
    this.element.className = 'control control-toggle';

    const bar = document.createElement('div');
    bar.className = 'toggle-bar';

    const labelEl = document.createElement('span');
    labelEl.className = 'toggle-label';
    labelEl.textContent = config.label ?? key;

    const right = document.createElement('div');
    right.className = 'toggle-right';

    const offSpan = document.createElement('span');
    offSpan.className = 'toggle-state-label toggle-off-label';
    offSpan.textContent = offLabel;

    this.trackEl = document.createElement('div');
    this.trackEl.className = 'toggle-track';

    const thumb = document.createElement('div');
    thumb.className = 'toggle-thumb';
    this.trackEl.appendChild(thumb);

    const onSpan = document.createElement('span');
    onSpan.className = 'toggle-state-label toggle-on-label';
    onSpan.textContent = onLabel;

    right.appendChild(offSpan);
    right.appendChild(this.trackEl);
    right.appendChild(onSpan);

    bar.appendChild(labelEl);
    bar.appendChild(right);
    this.element.appendChild(bar);

    this.updateDisplay();

    this.onClick = () => {
      this.value = this.value === 0 ? 1 : 0;
      this.updateDisplay();
      this.onChange?.(this.value);
    };
    bar.addEventListener('click', this.onClick);
  }

  private get value(): number {
    return (this.target as Record<string, number>)[this.key];
  }

  private set value(v: number) {
    (this.target as Record<string, number>)[this.key] = v;
  }

  private updateDisplay(): void {
    this.element.classList.toggle('toggle-on', this.value !== 0);
  }

  dispose(): void {}
}
