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

knob.addButton('Reset', () => {
  params.speed = 0.5;
  params.intensity = 1.0;
  console.log('Reset!');
});

const transformFolder = knob.addFolder({ title: 'Transform' });
transformFolder.add(position);
transformFolder.addButton('Randomize', () => {
  position.x = Math.random() * 10 - 5;
  position.y = Math.random() * 10 - 5;
  position.z = Math.random() * 10 - 5;
  console.log('Randomized:', position);
});

const visualFolder = knob.addFolder({ title: 'Visual', expanded: false });
visualFolder.add(params, {
  speed: { label: 'Another Speed' },
});
