export class ButtonControl {
  readonly element: HTMLElement;
  private btn: HTMLButtonElement;
  private onClick: () => void;

  constructor(label: string, onClick: () => void) {
    this.onClick = onClick;

    this.element = document.createElement('div');
    this.element.className = 'control control-button';

    this.btn = document.createElement('button');
    this.btn.className = 'button-btn';
    this.btn.textContent = label;
    this.btn.addEventListener('click', this.onClick);

    this.element.appendChild(this.btn);
  }

  dispose(): void {
    this.btn.removeEventListener('click', this.onClick);
  }
}
