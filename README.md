# `soundfield`

**soundfield** is a networked, audience-participation performance app built on the [soundworks](https://soundworks.dev) framework by Ircam. It transforms any audience into a collective sound instrument: every participant who joins the performance via their personal device becomes an active voice in a shared sonic field.

## Concept

Each audience member connects through their smartphone or laptop browser and gains control over a **granular synthesizer** fed by a shared sample library. They can:

- Choose an audio sample from the soundbank curated by the performer
- Navigate the sample's waveform to select a playback position
- Shape the texture by adjusting **density**, **rate**, and **volume** of the granular stream
- Start and stop their own granular voice independently

Meanwhile, the **controller** interface gives the performer a bird's-eye view of the entire ensemble — adjusting master volume, muting all players at once, and fine-tuning individual participants' synthesis parameters in real time. This dual-layer architecture (performer ↔ audience) enables a fluid choreography of sound: the performer sculpts the overall field while the audience co-creates its texture.

The result is a living, breathing soundscape that evolves with the collective decisions of everyone in the room.

## Architecture overview

| Role | URL | Description |
|------|-----|-------------|
| `player` | `/` | Audience member — granular synth UI |
| `controller` | `/controller` | Performer — global & per-player controls |

Audio samples are served from the `assets/` directory via the filesystem plugin and loaded dynamically into each player's `AudioContext`. The synchronisation layer relies on soundworks' shared state manager, so every parameter change propagates instantly across all connected clients.

---

## Available npm scripts

### `npm run dev`

Launch the application in development mode. Watch file system, compile and/or bundle files on change, and restart the server when needed.

### `npm run build`

Build the application. Compile and bundle the sources without launching the server.

### `npm run start`

Launch the server without building the application. Basically a shortcut for `node ./.build/server/index.js`.

### `npm run watch [name]` _(node clients only)_

Launch the `[name]` client and restart when the sources are updated. 

For example, if you are developing an application with a node client, you should run the `dev` script (to build the sources and start the server) in one terminal:

```bash
npm run dev
```

And launch and watch the node client(s) (e.g. called `thing`) in another terminal. The client will automatically restart when the sources are re-compiled by the `dev` script:

```bash
npm run watch thing
```
## Environment variables

### `ENV`

Define which environment config file should be used to run the application. Environment config files are located in the `/config` directory, are prefixed with `env-`. 

For example, given the following config files:

```
├─ config
│  ├─ env-default.json
│  └─ env-prod.json   
```

To start the server the `/config/env-prod.js` configuration file, you should run:

```bash
ENV=prod npm run start
``` 

If no `env` file is found, the application will generate a default config suitable for most development uses.

### `PORT`

Override the port defined in the config file. 

For example, to launch the server on port `3000` whatever the `port` value defined in the default configuration file, you should run:

```bash
PORT=3000 npm run start
```

## Emulating clients

In development it can be convenient to emulate several clients in the same browser window or same terminal

### Browsers clients

To emulate several browser clients in the same window, just append the query parameter `?emulate=[num_clients]` to the URL. For example to launch 10 clients side by side in the same window, you should run:

```
http://127.0.0.1:8000?emulate=10
```

## Credits

[soundworks](https://soundworks.dev) is developed by the ISMM team at Ircam

## License

[BSD-3-Clause](./LICENSE)
