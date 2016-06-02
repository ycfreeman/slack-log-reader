## Description

A little tool I just hacked up for filtering Slack logs, by channels and users,
code is very rough and untested

## Dependencies

* nodejs, npm

## Usage

Drop and extract your Slack logs in slack_logs directory,
it should support multiple exports

Follow this folder structure:
```
|- slack_logs
|-- Logs 1
|--- channels.json, users.json, etc
|-- Logs 2
|--- channels.json, users.json, etc
```

Install npm packages and run the express server
```
npm install
npm start
```

Then navigate to your browser at http://localhost:8080