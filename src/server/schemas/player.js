export default {
  id: {
    type: 'integer',
    default: null,
    nullable: true,
  },
  rate: { 
    type: 'float', 
    default: 1, 
    min: 0.01, 
    max: 2, 
  },
  volumeGrain: { 
    type: 'float', 
    default: 0.8, 
    min: 0.01, 
    max: 1.5, 
  }, 
  playGranular: { 
    type: 'boolean', 
    default: true, 
    immediate: true, 
  }, 
  startRecording: {
    type: 'boolean',
    default: false, 
    immediate: true, 
  },
  selected: {
    type: 'boolean',
    default: true, 
    immediate: true, 
  },
  stopRecording: {
    type: 'boolean',
    event: true,
  },
  recording: {
    type: 'boolean',
    event: true,
  },
  density: {
    type: 'float', 
    default: 0.4, 
    min: 0.01, 
    max: 0.5, 
  },
  position: {
    type: 'float', 
    default: 0.5, 
    min: 0.0, 
    max: 20.0, 
  },
};