const {
  InstanceBase,
  Regex,
  runEntrypoint,
  InstanceStatus,
  CompanionActionDefinitions,
  CompanionVariableDefinition,
  CompanionActionDefinition,
} = require('@companion-module/base');
const { getPlaydeckConfigFields, PlaydeckConfig } = require('./src/PlaydeckConfig');
const UpgradeScripts = require('./src/upgrades');
const { PlaydeckFeedbacks } = require('./src/PlaydeckFeedbacks');
const { PlaydeckVersion } = require('./src/PlaydeckVersion');
const { PlaydeckActions } = require('./src/PlaydeckActions');
const { PlaydeckPresets } = require('./src/PlaydeckPresets');
const { PlaydeckState } = require('./src/PlaydeckState');

const { PlaydeckConnectionManager } = require('./src/PlaydeckConnections/PlaydeckConnectionManager');
class PlaydeckInstance extends InstanceBase {
  /** @type { PlaydeckConfig } */
  config;
  /** @type { PlaydeckVersion } */
  version;
  /** @type { PlaydeckState } */
  state;
  /** @type { CompanionVariableDefinition[] } */
  variableDefinitions = [];
  /** @type { CompanionActionDefinitions } */
  actionDefinitions = {};

  constructor(internal) {
    super(internal);
  }

  async init(config) {
    this.config = config;
    this.version = new PlaydeckVersion(this.config.version);
    this.state = new PlaydeckState(this);
    this.updateStatus(InstanceStatus.Connecting);
    this.connectionManager = new PlaydeckConnectionManager(this);

    this.actions = new PlaydeckActions(this);
    this.feedbacks = new PlaydeckFeedbacks(this);

    this.presets = new PlaydeckPresets(this);
  }
  // When module gets deleted
  async destroy() {
    this.connectionManager.destroy();
    this.log('debug', 'destroy');
  }

  async configUpdated(config) {
    this.config = config;
    // this.connections.destroy();
    this.init(config);
  }
  getConfigFields() {
    return getPlaydeckConfigFields();
  }
}

runEntrypoint(PlaydeckInstance, UpgradeScripts);

module.exports = PlaydeckInstance;
