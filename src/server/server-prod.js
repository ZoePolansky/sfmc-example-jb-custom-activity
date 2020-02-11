import serveStatic from 'serve-static';
import express from 'express'
import webpack from 'webpack'

import config from '../../webpack.prod.config.js'

import webpackDevMiddleware from 'webpack-dev-middleware'

import path from 'path'

import ping from '../modules/ping/server';

const MODULES_BASE_PATH = '../src/modules';

const modules = [
  ping
];

const app = express(),
  DIST_DIR = __dirname,
  HTML_FILE = path.join(DIST_DIR, 'index.html'),
  compiler = webpack(config),
  router = express.Router();

// expose slds assets
app.use('/slds', serveStatic(path.join(__dirname, '../node_modules/@salesforce-ux/design-system/assets')));
app.use('/img', serveStatic(path.join(__dirname, '../src/img')));

console.log("---------------------------------------------------------");
console.log("----------------- REGISTERING Modules --------------------");
console.log("---------------------------------------------------------");

modules.forEach((module) => {

  let m = module.setup;

  m.routes.forEach((r) => {

    let path = `/modules/${m.name}/${r.path}`.replace('//', '/').replace('//', '/');

    switch(r.method) {
      case 'POST':
        app.post(path, r.resolve);
        console.log("-- ", r.method, path);
        break;
      case 'GET':
        app.get(path, r.resolve);
        console.log("--  ", r.method, path);
        break;
    };
  });
});

console.log("---------------------------------------------------------");

app.use('/', router);

app.use(express.static(DIST_DIR))
app.get('*', (req, res) => {
    res.sendFile(HTML_FILE)
});

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`)
  console.log('Press Ctrl+C to quit.')
});