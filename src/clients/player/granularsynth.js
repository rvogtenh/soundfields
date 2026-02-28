class GranularSynth {
    constructor(audioContext, buffer, player) {
      this.audioContext = audioContext;
      this.buffer = buffer;
      this.selected = false;
      this.selectedActive = false;
      this.minPos = 0;
      this.maxPos = 1;
      this.player = player;
      this.rate = 1;
  
      // time interval between each grain
      this.period = 0.025;
      // density of each grain
      this.duration = 0.1;
      // position of the grain in the buffer
      this.position = 0;
      
      // create an output gain on wich will connect all our grains
      this.output = this.audioContext.createGain();
      this.volume = this.audioContext.createGain(); 
      this.volume.connect(this.output); 
      // bind the render method so that we don't the instance context
      this.render = this.render.bind(this);
    }
  
    render(currentTime) {
      const jitter = Math.random() * 0.002; 
      const grainTime = currentTime + jitter; 
      // create our evenvelop gain
      const env = this.audioContext.createGain();
      // connect it to output
      env.connect(this.volume);
      // schedule the fadein and fadeout
      env.gain.value = 0;
      env.gain.setValueAtTime(0, grainTime); 
      env.gain.linearRampToValueAtTime(1, grainTime + this.density / 2); 
      env.gain.linearRampToValueAtTime(0, grainTime + this.density);
  
      // create the source that will play our grain
      const src = this.audioContext.createBufferSource();
      src.buffer = this.buffer;
      // connect to output
      src.connect(env);

      // play the grain at given position and for given density
      src.start(grainTime, this.position); 
      src.stop(grainTime + this.density);
      src.playbackRate.value = this.rate;
      //src.detune = this.rate * 1200;
  
      if (this.selectedActive) {
        this.selection(this.selected)
      } else {
        // increment position so that we read the file at speed divided by 4
        this.position += this.period / 3 * this.rate; 
        // make sure we don't try to pick a grain outside the buffer
        if (this.position > this.buffer.duration) {this.position = 0;} 
      }

      this.player.set({ position: this.position });
      
      // ask to be called at time of next grain
      return currentTime + this.period;
    }

    selection(obj){

        if (obj) {
          this.selected = obj;
          this.selectedActive = true;

          this.minPos = obj["selectionStart"];
          this.maxPos = obj["selectionEnd"];

          let delta = this.maxPos-this.minPos;

          this.position = (Math.random() * delta) + this.minPos;
        }
    }

    setVolume(value) {

      if (value) {
        this.volume.gain.value = value;
      }
    }
  }

  export default GranularSynth;