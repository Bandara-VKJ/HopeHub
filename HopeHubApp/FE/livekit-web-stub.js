const noop = () => {};
const Dummy = function () {};

module.exports = {
  // @livekit/react-native
  registerGlobals: noop,
  AudioSession: {
    startAudioSession: async () => {},
    stopAudioSession: async () => {},
  },
  VideoView: () => null,

  // livekit-client
  Room: Dummy,
  RoomEvent: {},
  ConnectionState: {},
  Track: { Source: {} },
  LocalVideoTrack: Dummy,
  RemoteVideoTrack: Dummy,
};