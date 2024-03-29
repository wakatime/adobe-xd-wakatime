const { storage } = require('uxp');
const { localFileSystem: fs } = storage;

const initialState = {
  apiKey: '',
};

class Preferences {
  constructor(state, saveFn = Preferences.saveToSettings) {
    this.state = Object.assign({}, initialState, state);
    this._saveFn = saveFn;
  }

  setState(next, cb) {
    const prev = this.state;
    this.state = Object.assign({}, prev, next);
    if (this._saveFn) {
      this._saveFn(this.state);
    }
    cb && cb(next, prev);
  }

  set apiKey(key) {
    this.setState({
      apiKey: key,
    });
  }

  get apiKey() {
    return this.state.apiKey;
  }

  static async saveToSettings(state) {
    const settingsFolder = await fs.getDataFolder();
    try {
      const settingsFile = await settingsFolder.createFile('settings.json', {
        overwrite: true,
      });
      if (settingsFile) {
        await settingsFile.write(JSON.stringify(state));
      } else {
        console.log(`[WakaTime] Couldn't serialize settings. ${err.message}`);
      }
    } catch (err) {
      console.log(`[WakaTime] Couldn't serialize settings. ${err.message}`);
    }
  }

  static async createFromSettings() {
    const settingsFolder = await fs.getDataFolder();
    try {
      const settingsFile = await settingsFolder.getEntry('settings.json');
      if (settingsFile) {
        const data = JSON.parse(await settingsFile.read());
        return new Preferences(data);
      } else {
        return new Preferences();
      }
    } catch (err) {
      // console.error(`[WakaTime] Could not read settings. ${err.message}`);
      return new Preferences();
    }
  }
}

module.exports = Preferences;
