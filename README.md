```
______     _   _ _ _____              _
|  ___|   | | (_|_)_   _|            | |
| |_ _   _| |_ _ _  | |_ __ __ _  ___| | __
|  _| | | | __| | | | | '__/ _` |/ __| |/ /
| | | |_| | |_| | | | | | | (_| | (__|   <
\_|  \__,_|\__| |_| \_/_|  \__,_|\___|_|\_\
             _/ |
            |__/
```

Installation
------------

```
yarn global add futjitrack
# or
npm i -g futjitrack
```

Usage
-----

First you have to provide the jira cloud instance name and your credentials

`futji-track auth set <jira> <user> <pass>`

Now you can list projects, list issues in projects and start tracking your time without ever leaving you good'old cli environment.

### Full list of commands

```
futji-track --help [cmd]                      Show general help or command help
futji-track auth set <jira> <user> <pass>     Set and save authentication
futji-track auth status                       Print authentication details
futji-track project ls                        List available projects
futji-track ticket ls <project>               List open tickets assigned to you.
futji-track track ls                          List currently running trackings
futji-track track start                       Start a new tracking
futji-track track stop <index>                Stop running tracking. Save work log in jira.
futji-track time ls                           List work logs saved in jira
futji-track time log <issue> <comment> <time> Log time in jira
```
