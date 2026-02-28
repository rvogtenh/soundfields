// src/players/components/sw-player.js
import { LitElement, html, css } from 'lit';

// import needed GUI components
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-toggle.js';
import '@ircam/sc-components/sc-button.js';
import '@ircam/sc-components/sc-waveform.js';
import '@ircam/sc-components/sc-record.js';
import '@ircam/sc-components/sc-dial.js';

class SwPlayer extends LitElement {
  constructor() {
    super();
    // reference to the `player` state
    this.player = null;
    // stores the `unsubscribe` callback returned by the `state.onUpdate` methos
    // https://soundworks.dev/soundworks/client.SharedState.html#onUpdate
    this._unobserve = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // update the component when a state change occurs
    this._unobserve = this.player.onUpdate(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // stop reacting to state change when the element is removed from the DOM
    this._unobserve();
  }

  _toggleRecording(e){
    if (this.player.get('recording')) {
      this.player.set({ startRecording: true });
    } else {
      this.player.set({ stopRecording: true });
    }
  }
  

  render() {
    // create controls for the player state
    return html`

      <h2>Recorder [id: ${this.player.get('id')}]</h2>

      <div style="padding-bottom: 4px;">
        <!-- <sc-text>Record Button</sc-text> -->
        <sc-button
          ?active=${this.player.get('startRecording')}
          ?selected=${this.player.get('Recording')}
          @input=${e => this.player.set({ recording: true })}
        >start Recording</sc-button>
       </span>

        <!-- <sc-text>Stop Record Button</sc-text> -->
        <sc-button
          ?active=${this.player.get('stopRecording')}
          @input=${e => this.player.set({ stopRecording: true })}
        >Stop Recording</sc-button>
      </div>

      <div style="padding-top: 10px;">
        <sc-slider
          min=${this.player.getSchema('position').min}
          max=${this.player.getSchema('position').max}
          value=${this.player.get('position')}
          @input=${e => this.player.set({ position: e.detail.value })}
        ></sc-slider>
        
        <sc-slider
          min=${this.player.getSchema('period').min}
          max=${this.player.getSchema('period').max}
          value=${this.player.get('period')}
          @input=${e => this.player.set({ period: e.detail.value })}
        ></sc-slider>
        
        <sc-slider
          min=${this.player.getSchema('duration').min}
          max=${this.player.getSchema('duration').max}
          value=${this.player.get('duration')}
          @input=${e => this.player.set({ duration: e.detail.value })}
        ></sc-slider>
      </div>
    `;
  }
}


// register the component into the custom elements registry
customElements.define('sw-player', SwPlayer);