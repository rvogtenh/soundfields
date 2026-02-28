export default {
  id: {
    type: 'integer',
    default: null,
    nullable: true,
  },
  startRecording: {
    type: 'boolean',
    event: true,
  },
  stopRecording: {
    type: 'boolean',
    event: true,
  },
  useRecordedAudio: {
    type: 'boolean',
    event: true,
  },
};