import { ipcRenderer } from 'electron';
import { exists, pathExistsSync, readFileSync } from 'fs-extra';

const debug = require('debug')('Ferdi:Plugin:RecipeWebview');

class RecipeWebview {
  constructor(badgeHandler, notificationsHandler) {
    this.badgeHandler = badgeHandler;
    this.notificationsHandler = notificationsHandler;

    ipcRenderer.on('poll', () => {
      this.loopFunc();

      debug('Poll event');

      // This event is for checking if the service recipe is still actively
      // communicating with the client
      ipcRenderer.sendToHost('alive');
    });
  }

  loopFunc = () => null;

  darkModeHandler = false;

  /**
   * Initialize the loop
   *
   * @param {Function}        Function that will be executed
   */
  loop(fn) {
    this.loopFunc = fn;
  }

  /**
   * Set the unread message badge
   *
   * @param {int} direct      Set the count of direct messages
   *                          eg. Slack direct mentions, or a
   *                          message to @channel
   * @param {int} indirect    Set a badge that defines there are
   *                          new messages but they do not involve
   *                          me directly to me eg. in a channel
   */
  setBadge(direct = 0, indirect = 0) {
    this.badgeHandler.setBadge(direct, indirect);
  }

  /**
   * Injects the contents of a CSS file into the current webview
   *
   * @param {Array} files     CSS files that should be injected. This must
   *                          be an absolute path to the file
   */
  injectCSS(...files) {
    files.forEach(async (file) => {
      if (pathExistsSync(file)) {
        const styles = document.createElement('style');
        styles.innerHTML = readFileSync(file, 'utf8');

        document.querySelector('head').appendChild(styles);

        debug('Append styles', styles);
      }
    });
  }

  injectJSUnsafe(...files) {
    Promise.all(files.map(async (file) => {
      if (await exists(file)) {
        return readFileSync(file, 'utf8');
      }
      debug('Script not found', file);
      return null;
    })).then(async (scripts) => {
      const scriptsFound = scripts.filter((script) => script !== null);
      if (scriptsFound.length > 0) {
        debug('Inject scripts to main world', scriptsFound);
        ipcRenderer.sendToHost('inject-js-unsafe', ...scriptsFound);
      }
    });
  }

  /**
   * Set a custom handler for turning on and off dark mode
   *
   * @param {function} handler
   */
  handleDarkMode(handler) {
    this.darkModeHandler = handler;
  }

  onNotify(fn) {
    if (typeof fn === 'function') {
      this.notificationsHandler.onNotify = fn;
    }
  }

  initialize(fn) {
    if (typeof fn === 'function') {
      fn();
    }
  }
}

export default RecipeWebview;
