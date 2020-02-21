/*
 * @author @jvelezpo
 */

const { prompt } = require("./lib/dialogs.js");

const openApiKeyDialog = async () => { 

    const title = 'WakaTime';
    const message = 'Enter your wakatime.com api key:';

    const result = await prompt(title, message, 'api key');

    if (result.which === 1) {
        const apiKey = result.value;
    }

}

module.exports = {
    commands: {
        apiKeyDialog: openApiKeyDialog
    }
};
