const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const migration = require('./trackerMigration');

const confPath = path.join(os.homedir(), '.futjiTrack');
const authFilePath = path.join(confPath, 'auth.json');
const trackingFilePath = path.join(confPath, 'trackings.json');

if (!fs.existsSync(confPath)) {
  fs.mkdirSync(confPath);
}

let trackerDataCache;
const getRawTrackerData = async () => {
  if (trackerDataCache) {
    return Promise.resolve(trackerDataCache);
  }

  if (!fs.existsSync(trackingFilePath)) {
    trackerDataCache = migration.createStrcuture();
    return Promise.resolve(trackerDataCache);
  }

  return fs.readFile(trackingFilePath)
    .then((data) => {
      trackerDataCache = JSON.parse(data);
      return trackerDataCache;
    });
};

const saveRawTrackerData = async (data) => {
  return fs.writeFile(trackingFilePath, JSON.stringify(data))
    .then(() => {
      // invalidate cache for may following actions
      trackerDataCache = null;
    });
};

const saveTrackerList = async (list) => {
  return getRawTrackerData()
    .then((data) => {
      data.trackers = list;
    })
    .then(saveRawTrackerData);
};

let conf;
module.exports = conf = {
  migrateTracker: () => {
    Promise.all([
      migration.getTrackerVersion(),
      conf.getTrackers()
    ]).then(([version, data]) => {
      return migration.migrate(version, data);
    });
  },
  getAuth: async () => {
    if (!fs.existsSync(authFilePath)) {
      return Promise.reject('No authentication saved. Setup first with auth-set command.');
    }

    return fs.readFile(authFilePath).then((authStr) => {
      return JSON.parse(authStr);
    });
  },
  setAuth: async (host, user, pass) => {
    return fs.writeFile(authFilePath, JSON.stringify({
      host, user, pass
    }));
  },
  getTrackers: async () => {
    getRawTrackerData()
      .then((data) => {
        return data.trackers;
      });
  },
  getOneTracker: async (index) => {
    return conf.getTrackers()
      .then((list) => {
        if (!list[index]) {
          return Promise.reject(`No tracking with index ${index} found`);
        }

        return list[index];
      });
  },
  addTracker: async (data) => {
    let newLength;
    return conf.getTrackers()
      .then((list) => {
        newLength = list.push(data);
        return list;
      })
      .then(saveTrackerList)
      .then(() => {
        return newLength - 1;
      });
  },
  setTracker : async (index, data) => {
    return conf.getTrackers()
      .then((list) => {
        list[index] = data;
        return list;
      })
      .then(saveTrackerList);
  },
  removeTracker: async (index) => {
    return conf.getTrackers()
      .then((list) => {
        if (!list[index]) {
          return Promise.reject(`No tracking with index ${index} found`);
        }

        list.splice(index, 1);
        return list;
      })
      .then(saveTrackerList);
  }
};
