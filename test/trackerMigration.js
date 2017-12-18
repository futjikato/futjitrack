const tape = require('tape');
const migration = require('./../lib/trackerMigration');

tape('migration from 1.1.3 -> 1.1.4', (t) => {
  t.plan(2);

  let oldData = require('./trackFileMocks/1.1.3.json');
  const newData = migration.migrations['1.1.4'](oldData);

  t.ok(newData.version);
  t.deepEqual(newData.trackers, [
    {
      "started": "2017-12-18T19:59:20+01:00",
      "issue":"FTTEST-1",
      "comment":"Comment",
      "startTimes": ["2017-12-18T19:59:20+01:00"],
      "stopTimes": [],
    }
  ]);
});
