const os = require('os');
const path = require('path');
const fs = require('fs-extra');

const confPath = path.join(os.homedir(), '.futjiTrack');
const authFilePath = path.join(confPath, 'auth.json');
const trackingFilePath = path.join(confPath, 'trackings.json');

if (!fs.existsSync(confPath)) {
  fs.mkdirSync(confPath);
}

let conf;
module.exports = conf = {
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
    if (!fs.existsSync(trackingFilePath)) {
      return Promise.resolve([]);
    }

    return fs.readFile(trackingFilePath).then((data) => {
      return JSON.parse(data);
    });
  },
  getOneTracker: async (index) => {
    return conf.getTrackers().then((list) => {
      if (!list[index]) {
        return Promise.reject(`No tracking with index ${index} found`);
      }

      return list[index];
    });
  },
  addTracker: async (data) => {
    conf.getTrackers().then((list) => {
      let newIndex = list.push(data);
      return fs.writeFile(trackingFilePath, JSON.stringify(list)).then(() => {
        return newIndex;
      });
    })
  },
  setTracker : async (index, data) => {
    conf.getTrackers().then((list) => {
      list[index] = data;
      return fs.writeFile(trackingFilePath, JSON.stringify(list));
    });
  },
  removeTracker: async (index) => {
    return conf.getTrackers().then((list) => {
      if (!list[index]) {
        return Promise.reject(`No tracking with index ${index} found`);
      }

      list.splice(index, 1);
      return fs.writeFile(trackingFilePath, JSON.stringify(list));
    });
  }
};
