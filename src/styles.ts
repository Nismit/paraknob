export const styles = `
:host {
  --accent-rgb: 74, 158, 255;

  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 11px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

:host(.floating) {
  right: auto;
}

.pane {
  background: rgba(28, 28, 32, 0.95);
  border-radius: 6px;
  min-width: 240px;
  color: #e0e0e0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.pane.collapsed .pane-content {
  display: none;
}

.header {
  display: flex;
  align-items: center;
  height: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.chevron:hover {
  opacity: 1;
}

.chevron-icon,
.folder-arrow {
  display: block;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid #888;
  transition: transform 0.15s;
}

.pane:not(.collapsed) .chevron-icon {
  transform: rotate(90deg);
}

.drag-handle {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
  cursor: grab;
  opacity: 0.5;
  transition: opacity 0.15s;
  touch-action: none;
}

.drag-handle:hover {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-icon {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drag-icon::before,
.drag-icon::after {
  content: '';
  width: 10px;
  height: 3px;
  background: repeating-linear-gradient(
    to right,
    #666 0px,
    #666 2px,
    transparent 2px,
    transparent 4px
  );
}

.pane-content {
  padding: 4px 0;
}

/* Folder */
.folder {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.folder:last-child {
  border-bottom: none;
}

.folder-header {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.folder-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.folder-header .folder-arrow {
  margin-right: 8px;
}

.folder:not(.collapsed) .folder-arrow {
  transform: rotate(90deg);
}

.folder-title {
  font-weight: 500;
  color: #ccc;
}

.folder-content {
  padding-left: 12px;
  overflow: hidden;
}

.folder.collapsed .folder-content {
  display: none;
}

/* Controls */
.control {
  padding: 4px 12px;
}

/* Number Control */
.number-bar {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  cursor: ew-resize;
  overflow: hidden;
  touch-action: none;
}

.number-bar:hover {
  background: rgba(255, 255, 255, 0.12);
}

.number-label {
  color: #aaa;
  pointer-events: none;
  z-index: 1;
}

.number-value {
  color: #fff;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  z-index: 1;
}

.number-gauge {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: rgba(var(--accent-rgb), 0.3);
  pointer-events: none;
}

.number-knob {
  position: absolute;
  top: 50%;
  left: 0;
  width: 2px;
  height: 16px;
  background: rgb(var(--accent-rgb));
  border-radius: 1px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.number-input {
  width: 60px;
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgb(var(--accent-rgb));
  border-radius: 2px;
  color: #fff;
  font-size: inherit;
  font-family: inherit;
  text-align: right;
  outline: none;
}
`;
