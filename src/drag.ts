export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export function createDragHandler(
  element: HTMLElement,
  handle: HTMLElement,
  onDragStart?: () => void,
  onDragEnd?: () => void,
) {
  const state: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  };

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;

    state.isDragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;

    const rect = element.getBoundingClientRect();
    state.offsetX = rect.left;
    state.offsetY = rect.top;

    handle.setPointerCapture(e.pointerId);
    onDragStart?.();
  }

  function onPointerMove(e: PointerEvent) {
    if (!state.isDragging) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    element.style.left = `${state.offsetX + dx}px`;
    element.style.top = `${state.offsetY + dy}px`;
  }

  function onPointerUp(e: PointerEvent) {
    if (!state.isDragging) return;

    state.isDragging = false;
    handle.releasePointerCapture(e.pointerId);
    onDragEnd?.();
  }

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('pointermove', onPointerMove);
  handle.addEventListener('pointerup', onPointerUp);
  handle.addEventListener('pointercancel', onPointerUp);

  return () => {
    handle.removeEventListener('pointerdown', onPointerDown);
    handle.removeEventListener('pointermove', onPointerMove);
    handle.removeEventListener('pointerup', onPointerUp);
    handle.removeEventListener('pointercancel', onPointerUp);
  };
}
