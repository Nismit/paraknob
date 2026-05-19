export interface SelectControlConfig {
  options: string[];
  label?: string;
}

export class SelectControl {
  readonly element: HTMLElement;
  private selectEl: HTMLSelectElement;
  private valueEl: HTMLElement;
  private onChange?: (value: string) => void;

  private target: object;
  private key: string;

  constructor(
    target: object,
    key: string,
    config: SelectControlConfig,
    onChange?: (value: string) => void,
  ) {
    this.target = target;
    this.key = key;
    this.onChange = onChange;

    this.element = document.createElement('div');
    this.element.className = 'control control-select';

    const bar = document.createElement('div');
    bar.className = 'select-bar';

    const labelEl = document.createElement('span');
    labelEl.className = 'select-label';
    labelEl.textContent = config.label ?? key;

    this.valueEl = document.createElement('span');
    this.valueEl.className = 'select-value';
    this.valueEl.textContent = this.value;

    const arrow = document.createElement('span');
    arrow.className = 'select-arrow';

    // Invisible select covers the entire bar for full-width tap target
    this.selectEl = document.createElement('select');
    this.selectEl.className = 'select-input';

    for (const opt of config.options) {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      if (opt === this.value) option.selected = true;
      this.selectEl.appendChild(option);
    }

    bar.appendChild(labelEl);
    bar.appendChild(this.valueEl);
    bar.appendChild(arrow);
    bar.appendChild(this.selectEl);
    this.element.appendChild(bar);

    this.selectEl.addEventListener('change', () => {
      this.value = this.selectEl.value;
      this.valueEl.textContent = this.value;
      this.onChange?.(this.value);
    });
  }

  private get value(): string {
    return (this.target as Record<string, string>)[this.key];
  }

  private set value(v: string) {
    (this.target as Record<string, string>)[this.key] = v;
  }

  dispose(): void {}
}
