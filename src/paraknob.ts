import { ButtonControl, NumberControl, type NumberControlConfig, SelectControl, type SelectControlConfig, ToggleControl, type ToggleControlConfig } from './controls';
import { createDragHandler } from './drag';
import { Folder, type FolderConfig } from './folder';
import { styles } from './styles';

export interface ParaKnobConfig {
  container?: HTMLElement;
  position?: { x: number; y: number };
  floating?: boolean;
}

export type ControlConfig = NumberControlConfig | SelectControlConfig | ToggleControlConfig;

export type AddConfig<T extends object> = {
  [K in keyof T]?: ControlConfig;
};

export class ParaKnob {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private root: HTMLElement;
  private header: HTMLElement;
  private chevron: HTMLElement;
  private content: HTMLElement;
  private cleanupDrag: (() => void) | null = null;
  private _floating: boolean;
  private _collapsed = false;

  constructor(config: ParaKnobConfig = {}) {
    this._floating = config.floating ?? true;

    this.host = document.createElement('div');
    this.host.className = 'paraknob-host';

    this.shadow = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = styles;
    this.shadow.appendChild(style);

    this.root = document.createElement('div');
    this.root.className = 'pane';

    this.header = document.createElement('div');
    this.header.className = 'header';

    this.chevron = document.createElement('button');
    this.chevron.className = 'chevron';
    this.chevron.innerHTML = '<span class="chevron-icon"></span>';
    this.chevron.addEventListener('click', () => this.toggle());

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '<span class="drag-icon"></span>';

    this.header.appendChild(this.chevron);
    this.header.appendChild(dragHandle);
    this.root.appendChild(this.header);

    this.content = document.createElement('div');
    this.content.className = 'pane-content';
    this.root.appendChild(this.content);

    this.shadow.appendChild(this.root);

    const container = config.container ?? document.body;
    container.appendChild(this.host);

    if (this._floating) {
      this.enableFloating(config.position);
    }
  }

  private enableFloating(position?: { x: number; y: number }): void {
    this.host.classList.add('floating');

    if (position) {
      this.host.style.left = `${position.x}px`;
      this.host.style.top = `${position.y}px`;
      this.host.style.right = 'auto';
    }

    const dragHandle = this.header.querySelector('.drag-handle') as HTMLElement;
    this.cleanupDrag = createDragHandler(this.host, dragHandle, () => {
      this.host.style.right = 'auto';
    });
  }

  private disableFloating(): void {
    this.host.classList.remove('floating');

    this.host.style.left = '';
    this.host.style.top = '';
    this.host.style.right = '';

    if (this.cleanupDrag) {
      this.cleanupDrag();
      this.cleanupDrag = null;
    }
  }

  get floating(): boolean {
    return this._floating;
  }

  set floating(value: boolean) {
    if (this._floating === value) return;
    this._floating = value;

    if (value) {
      this.enableFloating();
    } else {
      this.disableFloating();
    }
  }

  get collapsed(): boolean {
    return this._collapsed;
  }

  set collapsed(value: boolean) {
    if (this._collapsed === value) return;
    this._collapsed = value;
    this.root.classList.toggle('collapsed', value);
  }

  toggle(): void {
    this.collapsed = !this._collapsed;
  }

  add<T extends object>(target: T, config: AddConfig<T> = {}): this {
    const keys =
      Object.keys(config).length > 0
        ? Object.keys(config)
        : Object.keys(target);

    for (const key of keys) {
      const value = target[key as keyof T];
      const options = config[key as keyof T] ?? {};

      if (typeof value === 'number' && 'toggle' in (options ?? {})) {
        const control = new ToggleControl(target, key, options as ToggleControlConfig);
        this.content.appendChild(control.element);
      } else if (typeof value === 'number') {
        const control = new NumberControl(target, key, options as NumberControlConfig);
        this.content.appendChild(control.element);
      } else if (typeof value === 'string' && 'options' in (options ?? {})) {
        const control = new SelectControl(target, key, options as SelectControlConfig);
        this.content.appendChild(control.element);
      }
    }

    return this;
  }

  addButton(label: string, onClick: () => void): this {
    const control = new ButtonControl(label, onClick);
    this.content.appendChild(control.element);
    return this;
  }

  addFolder(config: FolderConfig): Folder {
    const folder = new Folder(config);
    this.content.appendChild(folder.element);
    return folder;
  }

  dispose(): void {
    if (this.cleanupDrag) {
      this.cleanupDrag();
    }
    this.host.remove();
  }
}
