/* ==========================================================
WakaTime
Description: Analytics for programmers.
Maintainer:  WakaTime <support@wakatime.com>
License:     BSD, see LICENSE for more details.
Website:     https://wakatime.com/
author:      @jvelezpo
===========================================================*/

'use strict';

let application = require('application');
const { shell } = require('uxp');
let scenegraph = require('scenegraph');
const os = require('os');

const Preferences = require('./lib/preferences');
const Libs = require('./lib/libs');
const { prompt, errorOpenWakatime } = require('./lib/dialog/dialogs');

const VERSION = '1.0.0';
let lastAction = 0,
  lastFile = undefined,
  lastGUID = undefined;

const openDashboardWebsite = async () => {
  const error = await errorOpenWakatime('Error', validation);
  if (error.which === 0) {
    const url = 'https://wakatime.com/';
    shell.openExternal(url);
  }
};

const getApiKey = async () => {
  const preferences = await Preferences.createFromSettings();
  const validation = Libs.validateKey(preferences.apiKey);
  if (validation !== '') {
    return '';
  }
  return preferences.apiKey;
};

const enoughTimePassed = () => {
  return lastAction + 120000 < Date.now();
};

const sendHeartbeat = async (file, time, project, language) => {
  const apiKey = await getApiKey();
  if (!apiKey) return;
  try {
    await fetch('https://wakatime.com/api/v1/heartbeats', {
      method: 'POST',
      body: JSON.stringify({
        time: time / 1000,
        entity: file,
        type: 'app',
        project,
        language,
        plugin: 'adobexd-wakatime/' + VERSION + ' ' + os.platform(),
      }),
      headers: {
        Authorization: 'Basic ' + Libs.btoa(apiKey),
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log('[WakaTime] Error:', err);
  }
  lastAction = time;
  lastFile = file;
};

const handleAction = () => {
  if (!scenegraph.selection.items.length) return;
  if (scenegraph.selection.items[0].guid == lastGUID) return;
  const node = scenegraph.selection.items[0];
  lastGUID = node.guid;
  const currentDocument = application.activeDocument;
  if (currentDocument) {
    var time = Date.now();
    if (enoughTimePassed() || lastFile !== currentDocument.name) {
      sendHeartbeat(node.name, time, currentDocument.name, 'Artboard');
    }
  }
};

(() => {
  console.log('[WakaTime] Initializing WakaTime plugin v' + VERSION);
  window.setInterval(async () => {
    handleAction();
  }, 5000);
})();

/**
 * Create the input modal where the user inputs his/her api key
 */
const openApiKeyDialog = async () => {
  const preferences = await Preferences.createFromSettings();

  const title = 'WakaTime';
  const message = 'Enter your wakatime.com api key:';

  const result = await prompt(title, message, 'api key', preferences.apiKey);

  if (result.which === 1) {
    const newApiKey = result.value;
    preferences.apiKey = newApiKey;
    const validation = Libs.validateKey(newApiKey);

    if (validation !== '') {
      openDashboardWebsite();
    } else {
      await prompt(title, 'api key set correctly');
    }
  }
};

module.exports = {
  commands: {
    apiKeyDialog: openApiKeyDialog,
  },
};
