import { ParaKnob } from './paraknob';

const params = {
  speed: 0.5,
  intensity: 1.0,
  enabled: true,
  color: '#ff0000',
};

const position = { x: 0, y: 0, z: 0 };

const knob = new ParaKnob();

knob.add(params, {
  speed: { min: 0, max: 2, step: 0.1, label: 'Animation Speed' },
  intensity: { min: 0, max: 10 },
});

const transformFolder = knob.addFolder({ title: 'Transform' });
transformFolder.add(position);

const visualFolder = knob.addFolder({ title: 'Visual', expanded: false });
visualFolder.add(params, {
  speed: { label: 'Another Speed' },
});
