"use strict";
const express = require('express'),
    fs = require('fs'),
    path = require('path');
var app = express();

var port = process.env.PORT || 8080;
var router = express.Router();

app.use(express.static(path.join(__dirname, "/public")));

/**
 * 1. search for folders inside slack_logs
 * 2. read channels.json
 * 3. read users.json
 * 4. foreach channel
 *      1. aggregate all logs in channel directory
 *      - filter by user id
 * 5. aggregate all logs
 * - filter by user id
 * read everything when server starts
 *
 */

// helpers
function getDirs(srcPath){
    return fs.readdirSync(srcPath).filter(function(file){
        return fs.statSync(path.join(srcPath, file)).isDirectory();
    });
}

const logRoot = path.join(__dirname, 'slack_logs');

// app methods
function getAllLogs(){
    return getDirs(logRoot);
}


function getChannels(folder) {
    let filePath = path.join(folder, "channels.json");
    let json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    var channels = [];
    json
        .forEach(function(item){
            channels.push(item.name);
        });
    return channels;
}

function getUsers(folder) {
    let filePath = path.join(folder, "users.json");
    let json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    var users = {};
    json.forEach(function(item){
        users[item.id] = item.name
    });
    return users;
}

function getLogs(channelDir) {
    let files = fs.readdirSync(channelDir);
    var logs = [];
    files.forEach(function(file){
        let log = JSON.parse(fs.readFileSync(path.join(channelDir, file), 'utf8'));
        log.forEach(function(line){
            logs.push(line);
        });
    });
    return logs;
}


function Logs(logDir) {
    let dir = path.join(logRoot, getAllLogs()[logDir]);
    let channelList = getChannels(dir);
    let userList = getUsers(dir);


    function Channel(channelName){
        let channelDir = path.join(dir, channelName);
        return {
            logs: getLogs(channelDir)
        }
    }

    let channels = {};

    channelList.forEach(function(channelName){
       channels[channelName] = new Channel(channelName);
    });

    return {
        channelList: channelList,
        channels: channels,
        getUserId: function(userName){
            var userId;
            for (var id in userList){
                if (userList[id] == userName) {
                    userId = id;
                }
            }
            return userId;
        },
        users: userList
    }
}


//routes
router.get('/', function(req, res) {
   res.json(getAllLogs());
});

router.route('/:logDir')
    .get(function(req, res){
        let logs = new Logs(req.params.logDir);
        res.json({
            channels: logs.channelList,
            users: logs.users
        });
    });

router.route('/:logDir/:channelName')
    .get(function(req, res) {
        let logs = new Logs(req.params.logDir);
        res.json(logs.channels[req.params.channelName].logs);
    });

router.route('/:logDir/__/:userName')
    .get(function(req, res){
        let data = new Logs(req.params.logDir);
        let channelList = data.channelList;
        let channels = data.channels;
        let userId = data.getUserId(req.params.userName);

        var retLogs = [];

        channelList.forEach(function(channel){
            retLogs = retLogs.concat(channels[channel].logs
                .filter(function(line){
                return userId == line.user;
            }));
        });

        res.json(retLogs);
    });

router.route('/:logDir/:channelName/:userName')
    .get(function(req, res) {
        let data = new Logs(req.params.logDir);
        let logs = data.channels[req.params.channelName].logs;
        let userId = data.getUserId(req.params.userName);

        res.json(logs.filter(function(line){
            return userId == line.user;
        }));
    });


app.use('/api', router);

app.listen(port);
console.log("Server starts on port: "+ port);