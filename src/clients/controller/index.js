import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';

import '../components/sw-audit.js';

import '@ircam/sc-components/sc-text.js'; 
import '@ircam/sc-components/sc-slider.js'; 
import '@ircam/sc-components/sc-toggle.js';
import '../components/sw-player.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

 async function main($container) {
  /**
   * Load configuration from config files and create the soundworks client
   */
  const config = loadConfig();
  const client = new Client(config);

  launcher.register(client, {
    initScreensContainer: $container,
    reloadOnVisibilityChange: false,
  });

  await client.start();

  const global = await client.stateManager.attach('global');

  const players = await client.stateManager.getCollection('player');

  function renderApp() {
    render(html`
      <div class="controller-layout">
        <header>
          <h1>${client.config.app.name} | ${client.role}</h1>
          <sw-audit .client="${client}"></sw-audit>
        </header>
        <section>
          <h2>Global</h2> 
          <div style="padding-bottom: 4px"> 
            <sc-text class = "paramtext">master</sc-text> 
            <sc-slider class = "params"
              min=${global.getSchema('master').min} 
              max=${global.getSchema('master').max} 
              value=${global.get('master')} 
              @input=${e => global.set({ master: e.detail.value })} 
            ></sc-slider> 
          </div>
          <div style="padding-bottom: 4px">
            <sc-text class = "paramtext">period</sc-text>
          <sc-slider class = "params"
            min=${global.getSchema('period').min}
            max=${global.getSchema('period').max}
            value=${global.get('period')}
            @input=${e => global.set({ period: e.detail.value })}
          ></sc-slider>

          </div> 
          <div style="padding-bottom: 4px"> 
            <sc-text class = "paramtext">mute</sc-text> 
            <sc-toggle 
              ?active=${global.get('mute')} 
              @change=${e => global.set({ mute: e.detail.value })} 
            ></sc-toggle> 
          </div>
        </section>
        <section>
          <h2>Players</h2>
          ${players.map(player => { 
            return html` 
            <div style="padding-bottom: 4px" class="playerview">

              <h3>Player ${player.get('id')}</h3>
               <div style="padding-bottom: 4px">
                <sc-text class = "paramtext">player: ${player.get('id')} - density</sc-text>
                <sc-slider class = "params"
                  min=${player.getSchema('density').min}
                  max=${player.getSchema('density').max} 
                  value=${player.get('density')}
                  @input=${e => player.set({ density: e.detail.value })}
                ></sc-slider>
              </div>
              <div style="padding-bottom: 4px">
                <sc-text class = "paramtext">player: ${player.get('id')} - rate</sc-text>
                <sc-slider class = "params"
                  min=${player.getSchema('rate').min}
                  max=${player.getSchema('rate').max} 
                  value=${player.get('rate')}
                  @input=${e => player.set({ rate: e.detail.value })}
                ></sc-slider>
              </div>
              <div style="padding-bottom: 4px">
                <sc-text class = "paramtext">player: ${player.get('id')} - volume</sc-text>
                <sc-slider class = "params"
                  min=${player.getSchema('volumeGrain').min}
                  max=${player.getSchema('volumeGrain').max} 
                  value=${player.get('volumeGrain')}
                  @input=${e => player.set({ volumeGrain: e.detail.value })}
                ></sc-slider>
              </div>
              <div>
                <sc-text class = "paramtext">player: ${player.get('id')} - Play on/off</sc-text>
                <sc-toggle class = "params"
                  ?active=${player.get('playGranular')}
                  @change=${e => {
                    var sel = e.detail.value;
                    player.set({ playGranular: sel });
                  }}
                ></sc-toggle>
              </div>
            </div>
            `   
            // `<sw-player .player=${player}></sw-player>`; 
          })} 
        </section>
      </div>
    `, $container);
  }

  global.onUpdate(() => renderApp(), true);

  // refresh the screen on each players collection event
  players.onAttach(() => renderApp()); 
  players.onDetach(() => renderApp()); 
  players.onUpdate(() => renderApp()); 
}

launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
  width: '50%',
});
