const compareVersions = require('compare-versions');
const packageJson = require('./../package.json');
const moment = require('moment');

const addMetaData = (data) => {
  return {
    version: packageJson.version,
    trackers: data
  };
};

const convertStartDateToArray = (data) => {
  data.trackers = data.trackers.map((tracker) => {
    tracker.startTimes = [];
    tracker.startTimes.push(tracker.started);
    tracker.stopTimes = [];

    return tracker;
  });

  return data;
};

let migration;
module.exports = migration = {
  createStrcuture: () => {
    return {
      version: '1.1.4',
      trackers: []
    }
  },
  createTracker: () => {
    return {
      inactive: false,
      startTimes: [moment().format()],
      stopTimes: [],
      issue: '',
      comment: ''
    };
  },
  migrations: {
    '1.1.4': (data) => {
      data = addMetaData(data);
      return convertStartDateToArray(data);
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
      return Promise.reject('No tracker file found. No migration needed.');
    }
    if (oldVersion === packageJson.version) {
      return Promise.reject('Tracker file is up to date. No migration needed.');
    }

    return fs.readFile(trackingFilePath).then((data) => {
      return JSON.parse(data);
    }).then((data) => {
      if (Array.isArray(data)) {
        return '1.1.3';
      } else {
        return data.version;
      }
    });
  }
};
