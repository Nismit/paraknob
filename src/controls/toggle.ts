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
  private onLabel: string;
  private offLabel: string;
  private barEl: HTMLElement;
  private valueEl: HTMLElement;
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
    this.onLabel = config.onLabel ?? '1';
    this.offLabel = config.offLabel ?? '0';
    this.onChange = onChange;

    this.element = document.createElement('div');
    this.element.className = 'control control-toggle';

    this.barEl = document.createElement('div');
    this.barEl.className = 'toggle-bar';

    const labelEl = document.createElement('span');
    labelEl.className = 'toggle-label';
    labelEl.textContent = config.label ?? key;

    this.valueEl = document.createElement('span');
    this.valueEl.className = 'toggle-value';

    this.barEl.appendChild(labelEl);
    this.barEl.appendChild(this.valueEl);
    this.element.appendChild(this.barEl);

    this.updateDisplay();

    this.onClick = () => {
      this.value = this.value === 0 ? 1 : 0;
      this.updateDisplay();
      this.onChange?.(this.value);
    };
    this.barEl.addEventListener('click', this.onClick);
  }

  private get value(): number {
    return (this.target as Record<string, number>)[this.key];
  }

  private set value(v: number) {
    (this.target as Record<string, number>)[this.key] = v;
  }

  private updateDisplay(): void {
    const isOn = this.value !== 0;
    this.barEl.classList.toggle('toggle-on', isOn);
    this.valueEl.textContent = isOn ? this.onLabel : this.offLabel;
  }

  refresh(): void {
    this.updateDisplay();
  }

  dispose(): void {
    this.barEl.removeEventListener('click', this.onClick);
  }
}
