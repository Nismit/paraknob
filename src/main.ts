import { ParaKnob } from './paraknob';

const params = {
  speed: 0.5,
  intensity: 1.0,
  count: 10,
  enabled: true,
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
  blendMode: { options: ['normal', 'multiply', 'screen', 'overlay'], label: 'Blend Mode' },
  easing: { options: ['linear', 'ease-in', 'ease-out', 'ease-in-out'], label: 'Easing' },
});

const transformFolder = knob.addFolder({ title: 'Transform' });
transformFolder.add(position);

const visualFolder = knob.addFolder({ title: 'Visual', expanded: false });
visualFolder.add(params, {
  speed: { label: 'Another Speed' },
});
