import { ParaKnob } from './paraknob';

const params = {
  speed: 0.5,
  intensity: 1.0,
  count: 10,
  enabled: 0,
  visible: 1,
  color: '#ff0000',
  blendMode: 'normal',
  easing: 'linear',
};

const position = { x: 0, y: 0, z: 0 };

// Feedback display for button demo
const log = document.createElement('div');
log.style.cssText =
  'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
  'color:#888;font-family:system-ui,sans-serif;font-size:12px;' +
  'background:rgba(0,0,0,0.5);padding:6px 14px;border-radius:4px;' +
  'pointer-events:none;white-space:nowrap;';
log.textContent = 'Press a button to see feedback';
document.body.appendChild(log);

const showLog = (msg: string) => {
  log.textContent = msg;
};

const knob = new ParaKnob();

knob.add(params, {
  speed: { min: 0, max: 2, label: 'Animation Speed' },
  intensity: { min: 0, max: 10 },
  count: { min: 0, max: 10, step: 1, label: 'Count (Integer)' },
  enabled: { toggle: true, label: 'Enabled', onLabel: 'on', offLabel: 'off' },
  visible: {
    toggle: true,
    label: 'Visible',
    onLabel: 'true',
    offLabel: 'false',
  },
  blendMode: {
    options: ['normal', 'multiply', 'screen', 'overlay'],
    label: 'Blend Mode',
  },
  easing: {
    options: ['linear', 'ease-in', 'ease-out', 'ease-in-out'],
    label: 'Easing',
  },
});

knob.addButton('Reset Params', () => {
  params.speed = 0.5;
  params.intensity = 1.0;
  params.count = 10;
  knob.refresh();
  showLog(
    `Reset — speed: ${params.speed}, intensity: ${params.intensity}, count: ${params.count}`,
  );
});

const transformFolder = knob.addFolder({ title: 'Transform' });
transformFolder.add(position);
transformFolder.addButton('Randomize', () => {
  position.x = Math.round((Math.random() * 10 - 5) * 100) / 100;
  position.y = Math.round((Math.random() * 10 - 5) * 100) / 100;
  position.z = Math.round((Math.random() * 10 - 5) * 100) / 100;
  transformFolder.refresh();
  showLog(`Randomize — x: ${position.x}, y: ${position.y}, z: ${position.z}`);
});

const visualFolder = knob.addFolder({ title: 'Visual', expanded: false });
visualFolder.add(params, {
  speed: { label: 'Another Speed' },
});
