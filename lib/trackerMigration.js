const compareVersions = require('compare-versions');
const packageJson = require('./../package.json');
const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const confPath = path.join(os.homedir(), '.futjiTrack');
const trackingFilePath = path.join(confPath, 'trackings.json');

class NoMigrationNeeded extends Error {}

const addMetaData = (data) => {
  return {
    version: packageJson.version,
    trackers: data
  };
};

const v1_1_4_detail_changes = (data) => {
  data.trackers = data.trackers.map((tracker) => {
    tracker.inactive = false;
    tracker.recordedTime = 0;

    return tracker;
  });

  return data;
};

let migration;
module.exports = migration = {
  NoMigrationNeeded,
  createStrcuture: () => {
    return {
      version: '1.1.4',
      trackers: []
    }
  },
  createTracker: () => {
    return {
      inactive: false,
      started: moment().format(),
      issue: '',
      comment: '',
      recordedTime: 0
    };
  },
  migrations: {
    '1.1.4': (data) => {
      data = addMetaData(data);
      return v1_1_4_detail_changes(data);
    }
  },
  migrate: (oldVersion, data) => {
    if (compareVersions('1.1.4', oldVersion)) {
      data = migration.migrations['1.1.4'](data);
    }

    return data;
  },
  getTrackerVersion: () => {
    if (!fs.existsSync(trackingFilePath)) {
      return Promise.reject(new NoMigrationNeeded('No tracker file found. No migration needed.'));
    }

    return fs.readFile(trackingFilePath).then((data) => {
      return JSON.parse(data);
    }).then((data) => {
      if (Array.isArray(data)) {
        return '1.1.3';
      } else {
        if (data.version === packageJson.version) {
          return Promise.reject(new NoMigrationNeeded('Tracker file is up to date. No migration needed.'));
        }
        return data.version;
      }
    });
  }
};
