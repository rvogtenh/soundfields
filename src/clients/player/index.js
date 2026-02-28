import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';
import { Scheduler } from '@ircam/sc-scheduling';

import pluginFilesystem from '@soundworks/plugin-filesystem/client.js';

import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js';

import { AudioBufferLoader } from '@ircam/sc-loader'; 

import '../components/sw-credits.js';
//import '../components/sw-player.js'; 
import '@ircam/sc-components/sc-select.js';

// import samplePlayer from './sampleplayer.js';
// import Recorder from './recorder.js';
import GranularSynth from './granularsynth.js';

// import needed GUI components
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-toggle.js';
import '@ircam/sc-components/sc-button.js';
import '@ircam/sc-components/sc-waveform.js';
import '@ircam/sc-components/sc-record.js';
import '@ircam/sc-components/sc-dial.js';

// import '@ircam/sc-components/sc-text.js'; 
// import '@ircam/sc-components/sc-slider.js'; 
// import '@ircam/sc-components/sc-toggle.js';
// import '@ircam/sc-components/sc-bang.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

/**
 * If multiple clients are emulated you might to want to share some resources
 */
// const audioContext = new AudioContext();

// If multiple clients are emulated you might to want to share the audio context 
const audioContext = new AudioContext(); 

async function main($container) {
  /**
   * Load configuration from config files and create the soundworks client
   */

  const config = loadConfig();
  const client = new Client(config);

  // register the platform-init plugin, and pass it the AudioContext instance 
  // so that it is resumed on the splashscreen user gesture 
  client.pluginManager.register('platform-init', pluginPlatformInit, {  
    audioContext, 
  }); 

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);

  client.pluginManager.register('filesystem', pluginFilesystem, {});

  /**
   * Register the soundworks client into the launcher
   *
   * The launcher will do a bunch of stuff for you:
   * - Display default initialization screens. If you want to change the provided
   * initialization screens, you can import all the helpers directly in your
   * application by doing `npx soundworks --eject-helpers`. You can also
   * customise some global syles variables (background-color, text color etc.)
   * in `src/clients/components/css/app.scss`.
   * You can also change the default language of the intialization screen by
   * setting, the `launcher.language` property, e.g.:
   * `launcher.language = 'fr'`
   * - By default the launcher automatically reloads the client when the socket
   * closes or when the page is hidden. Such behavior can be quite important in
   * performance situation where you don't want some phone getting stuck making
   * noise without having any way left to stop it... Also be aware that a page
   * in a background tab will have all its timers (setTimeout, etc.) put in very
   * low priority, messing any scheduled events.
   */
  launcher.register(client, { initScreensContainer: $container });

  /**
   * Launch application
   */
  await client.start();

  // attach to the global state 
  const global = await client.stateManager.attach('global');

  const player = await client.stateManager.create('player', { 
    id: client.id, 
  });

  const filesystem = await client.pluginManager.get('filesystem');
  //await filesystem.writeFile('my-file.txt', 'Hello Client');

  const loader = new AudioBufferLoader(48000);

  let files = {};
  let samples = {};
  
  function loadFiles() {
    const soundbankTree = filesystem.getTree();
    const defObj = {};
    //const index = 0;

    soundbankTree.children.forEach(leaf => {
      if (leaf.type === 'file') {
        defObj[leaf.name] = leaf.url;
      }
    });
    return defObj;
  }

  async function loadSamples(name) {

    files = loadFiles();
    samples = await loader.load(files, true);
    if (name) {
      console.log(name);
      setTimeout(() => {
        let element = document.getElementById("sampleSelect");
        element.value = name;
        //granular.buffer = samples[name];
        triggerChange(element); 

        renderApp();
      }, 1000);
    };
    await renderApp();

  }

  function triggerChange(element) {
    let changeEvent = new Event("change");
    element.dispatchEvent(changeEvent);
  }

  files = loadFiles();
  samples = await loader.load(files, true);

  // Update Samples
  filesystem.onUpdate((e) => {
    console.log(e.events);
    let name = e.events[0].node.name;
    loadSamples(name)
  });

  console.log(files);
  console.log(samples);
  console.log(filesystem.getTree());

  let buffer =  samples[Object.keys(samples)[1]];
  console.log(buffer);

  // create the master bus chain 
  // [mute <GainNode>] -> [master <GainNode>] -> [destination] 
  const master = audioContext.createGain(); 
  master.gain.value = global.get('master'); 
  master.connect(audioContext.destination); 
  
  const mute = audioContext.createGain(); 
  mute.gain.value = global.get('mute') ? 0 : 1; 
  mute.connect(master);
  let rate = 1;

  // let sound = new samplePlayer(audioContext, buffer);
  // let sampleRecorder = new Recorder(audioContext, client.id, filesystem);
  // await sampleRecorder.init();
  // sound.render;

  
  // create a new scheduler, in the audioContext timeline
  const scheduler = new Scheduler(() => audioContext.currentTime);
  // create out granular synth and connect it to audio destination
  const granular = new GranularSynth(audioContext, buffer, player);
  granular.output.connect(mute);
  // register the synth into the scheduler and start it now
  //scheduler.add(granular.render, audioContext.currentTime);

  async function triggerSelection() {

    // let x = document.getElementById("wavetoggle")
    // x.setAttribute('active', true);
    // console.log("triggerSelection");

    player.set({ selected: true });
    granular.selectedActive = true;
    renderApp;
  }

  async function undoSelection() {
    // let x = document.getElementById("wavetoggle")
    // x.setAttribute('active', false);
    
    console.log("undoSelection");
    granular.selectedActive = false;
    //player.set({ selected: false });
   
    // let y = document.getElementById("waveform")
    // y.setAttribute('?selection', false);
    renderApp;
  }

  player.onUpdate(updates => { 
    for (let key in updates) { 
      const value = updates[key]; 
   
      switch (key) { 

        case 'playGranular': {
          if (value === true) {
            scheduler.add(granular.render, audioContext.currentTime);
            console.log("start Granular"); 
          } else {
            scheduler.remove(granular.render, audioContext.currentTime); 
          }
          break;
        }

        case 'period': {                                  
          if (value !== null) {
            granular.period = value; 
          }
          break;
        }

        case 'volumeGrain': {
          if (value !== null) {                                       
            granular.setVolume(value); 
          }
          break;
        }

        case 'density': {
          if (value !== null) {
            granular.density = value; 
          }
          break;
        }

        case 'rate': {
          if (value !== null) {
            granular.rate = value;  
          }
          break;
        }

        case 'selected': {
          if (value === true) {
            player.set({ selected: true});  
          } else {
            player.set({ selected: false});  
          }
          break;
        }

        case 'position': {
          if (value !== null) {
            granular.position = value; 
          }
          break;
        }
      } 
    } 
   
    renderApp(); 
  }, true); 

  function renderApp() {
    render(html`

      <div class="simple-layout">
        
      <section> 
        <!-- <p>Hello ${client.config.app.name}!</p>  -->
        <!-- <h2>Global</h2> 
        <p>Master: ${global.get('master')}</p> 
        <p>Mute: ${global.get('mute')}</p>  --> 
        
        <h2>Player [id: ${player.get('id')}]</h2>

          <sc-waveform id = "waveform"
            .buffer=${granular.buffer}
            cursor=true
            ?selection=${player.get('selected')}
            cursor-position=${granular.position}
            @touchstart=${e => { 
              // player.set({ selected: true });
              //granular.selectedActive = true;              
              //granular.selection(e.detail.value);
              //renderApp;
              }}
            @input=${e => granular.selection(e.detail.value)}
            @change=${e => {

              granular.selectedActive = true;
              myVar = setTimeout(undoSelection, 3000)
              player.set({ selected: true });
              renderApp;
            }}
          ></sc-waveform>

          <select id="sampleSelect" 
            @change=${function useSelection() {
              var x = document.getElementById("sampleSelect").value;
              // document.getElementById("demo").innerHTML = "You selected: " + x;
              console.log(x);
              granular.buffer = samples[x];
              renderApp();
              
            }}
           >
            
            ${Object.keys(files).map(key => {
            return html `<option value="${key}">${key}</option>`
            })};
          </select>

          
          <sc-text class = "paramtext">density</sc-text>
          <sc-slider class = "params"
            min=${player.getSchema('density').min}
            max=${player.getSchema('density').max}
            value=${player.get('density')}
            @input=${e => player.set({ density: e.detail.value })}
          ></sc-slider>

          <sc-text class = "paramtext">rate</sc-text>
          <sc-slider class = "params"
            min=${player.getSchema('rate').min}
            max=${player.getSchema('rate').max}
            value=${player.get('rate')}
            @input=${e => player.set({ rate: e.detail.value })}
          ></sc-slider>

          <sc-text class = "paramtext">volume</sc-text>
          <sc-slider class = "params"
            min=${player.getSchema('volumeGrain').min}
            max=${player.getSchema('volumeGrain').max}
            value=${player.get('volumeGrain')}
            @input=${e => player.set({ volumeGrain: e.detail.value })}
          ></sc-slider>

          <sc-text class = "paramtext">Play on/off</sc-text>
          <sc-toggle
            id="activate" 
            class = "params"
            ?active=${player.get('playGranular')}
            @change=${e => {
              var sel = e.detail.value;
              player.set({ playGranular: sel });
              console.log(e.detail.value);
              renderApp();
            }}
          ></sc-toggle>

          <sw-credits .infos="${client.config.app}"></sw-credits>
      </section> 

    </div>

    `, $container);
  }

  global.onUpdate(updates => {  
    for (let key in updates) {  
      const value = updates[key];  
    
      switch (key) {  
        case 'master': {  
          const now = audioContext.currentTime;  
          master.gain.setTargetAtTime(value, now, 0.02);  
          break;  
        }  
        case 'mute': {  
          const gain = value ? 0 : 1;  
          const now = audioContext.currentTime;  
          mute.gain.setTargetAtTime(gain, now, 0.02);  
          break;  
        }        
        case 'period': {  
          if (value !== null) {
            granular.period = value; 
          }
          break;
          break;  
        }  
      }  
    }  
    // update the view to log current global values  
    renderApp();  
  }, true);  

}
// let starter = document.getElementById("waveform");
// window.addEventListener('mousedown', triggerSelection);
// element.addEventListener('touchend', undoSelection(element.value));


// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
});