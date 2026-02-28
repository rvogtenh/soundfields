// src/server/schemas/global.js
export default { 
  master: { 
    type: 'float', 
    default: 1, 
    min: 0, 
    max: 1, 
  }, 
  mute: { 
    type: 'boolean', 
    default: false, 
  }, 
  period: {
    type: 'float', 
    default: 0.07, 
    min: 0.01, 
    max: 0.1, 
  },
}; 