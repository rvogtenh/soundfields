import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import { loadConfig } from '@soundworks/helpers/node.js';
import { AudioBufferLoader } from '@ircam/sc-loader'; 
import pluginFilesystem from '@soundworks/plugin-filesystem/server.js';

import pluginPlatformInit from '@soundworks/plugin-platform-init/server.js';

import globalSchema from './schemas/global.js';
import playerSchema from './schemas/player.js';
//import recorderSchema from './schemas/recorder.js';

import '../utils/catch-unhandled-errors.js';

//import express from 'express';
//import fs from 'fs';
//import path from 'path';
//import multer from 'multer'; // Änderungen: Hinzufügen von multer für Datei-Uploads
// import cors from 'cors';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

/**
 * Create the soundworks server
 */
const server = new Server(config);
// configure the server for usage within this application template
server.useDefaultApplicationTemplate();

// Initialize the Audio Context with a Click
server.pluginManager.register('platform-init', pluginPlatformInit); 

// register the global schema 
server.stateManager.registerSchema('global', globalSchema); 
server.stateManager.registerSchema('player', playerSchema);
//server.stateManager.registerSchema('recorder', recorderSchema);

server.pluginManager.register('filesystem', pluginFilesystem, {
  // path to the watched directory, can be relative to process.cwd()
  // or absolute, in all cases file paths in the tree will be normalized
  // to be relative to `process.cwd()`
  dirname: 'assets',
  // if defined, add an `url` to each tree node, that defines the
  // route at which the files are publicly accessible.
  publicPath: 'assets',
});

// server.router.use(cors());

// server.router.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://127.0.0.1"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
/**
 * Register plugins and schemas
 */
// server.pluginManager.register('my-plugin', plugin);
// server.stateManager.registerSchema('my-schema', definition);

/**
 * Launch application (init plugins, http server, etc.)
 */
await server.start();

// create the shared global state instance 
const global = await server.stateManager.create('global'); 
console.log(global.getValues()); 

const filesystem = await server.pluginManager.get('filesystem');


//await filesystem.writeFile('my-file.txt', 'Hello Server');

// Konfigurieren Sie multer für die Speicherung von Dateien
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, 'assets/'))
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// });

// const upload = multer({ storage: storage });

// // Router für Abspeicherung der Audiofiles
// server.router.post('/save-recording', upload.single('audio'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'Something happend: No file uploaded' });
//   }

//   res.status(200).json({ 
//     message: 'File uploaded successfully', 
//     fileName: req.file.originalname 
//   });
// });


