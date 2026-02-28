
class samplePlayer {

constructor(audioContext, buffer) {
    this.audioContext = audioContext;
    this.buffer = buffer;
    this.active = false;

    this.fadeTime = 0.01; // 10ms fade
    // this.render = this.render.bind(this);
}

start(time) {

    // create an audio buffer source node
    this.src = this.audioContext.createBufferSource();
    // set it's buffer with the audio buffer we loaded earlier
    this.src.buffer = this.buffer;

    // NEUE ZEILEN: Gain-Node für Fades hinzugefügt
    this.gainNode = this.audioContext.createGain();
    this.src.connect(this.gainNode);
    // connect the node to the destination
    this.gainNode.connect(this.audioContext.destination)
    
    // looping the sample
    this.src.loop = true;
    //this.src.playbackRate.value = this.rate;

    // start plyaback
    if (this.active == false) {
        
    // NEUE ZEILEN: Fade-In hinzugefügt
    const now = this.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(1, now + this.fadeTime);
    
    // den Loop starten
    this.src.start(time);
    this.active = true;
    console.log("src this.start");
    }
}

stop(time) {
    if (this.active == true) {
      // NEUE ZEILEN: Fade-Out hinzugefügt
      const now = this.audioContext.currentTime;
      this.gainNode.gain.setValueAtTime(1, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + this.fadeTime);
      
      setTimeout(() => {
        this.src.stop(time);
        this.active = false;
        this.src = null;
        console.log("src this.stop");
      }, this.fadeTime * 1000);
    }
  }

rate(rate) {
    if (this.src) {
        this.src.playbackRate.value = rate;
    }
}
}

export default samplePlayer;