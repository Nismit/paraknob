import {
  ButtonControl,
  NumberControl,
  type NumberControlConfig,
  SelectControl,
  type SelectControlConfig,
  ToggleControl,
  type ToggleControlConfig,
} from './controls';

type ControlConfig =
  | NumberControlConfig
  | SelectControlConfig
  | ToggleControlConfig;

type AddConfig<T extends object> = {
  [K in keyof T]?: ControlConfig;
};

export interface FolderConfig {
  title: string;
  expanded?: boolean;
}

export class Folder {
  readonly element: HTMLElement;
  private header: HTMLElement;
  private content: HTMLElement;
  private expanded: boolean;

  constructor(config: FolderConfig) {
    this.expanded = config.expanded ?? true;

    this.element = document.createElement('div');
    this.element.className = 'folder';

    this.header = document.createElement('div');
    this.header.className = 'folder-header';

    const arrow = document.createElement('span');
    arrow.className = 'folder-arrow';

    const title = document.createElement('span');
    title.className = 'folder-title';
    title.textContent = config.title;

    this.header.appendChild(arrow);
    this.header.appendChild(title);

    this.content = document.createElement('div');
    this.content.className = 'folder-content';

    this.element.appendChild(this.header);
    this.element.appendChild(this.content);

    this.header.addEventListener('click', () => this.toggle());
    this.updateState();
  }

  toggle(): void {
    this.expanded = !this.expanded;
    this.updateState();
  }

  private updateState(): void {
    this.element.classList.toggle('collapsed', !this.expanded);
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
        const control = new ToggleControl(
          target,
          key,
          options as ToggleControlConfig,
        );
        this.content.appendChild(control.element);
      } else if (typeof value === 'number') {
        const control = new NumberControl(
          target,
          key,
          options as NumberControlConfig,
        );
        this.content.appendChild(control.element);
      } else if (typeof value === 'string' && 'options' in (options ?? {})) {
        const control = new SelectControl(
          target,
          key,
          options as SelectControlConfig,
        );
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

  getContentElement(): HTMLElement {
    return this.content;
  }
}
