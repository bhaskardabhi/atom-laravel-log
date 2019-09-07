'use babel';

// Created
    // -> Get Latest Error and display it
    //     -> Update Last Error timestamp
// modified
    // -> Get Latest Error and display it
    //     -> Update Last Error timestamp

export default class LaravelLogReader {
    
    constructor() {
        this.logRegex = new RegExp("\\[\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\] (\\w+.(ERROR|INFO)):*(.+)",'g');
        this.timeRegex = new RegExp("\\[\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\]",'g');
        this.typeRegex = new RegExp("(\w+.(ERROR|INFO))",'g');
        this.registeredLogs = {};
        this.notificationType = {
            'INFO' : 'addFatalError',
            'ERROR' : 'addInfo',
        };
    }
    
    readFileErrors (path){
        var fs = require('fs'),
            that = this;
            
        return new Promise((resolve,reject) => {
            return fs.readFile(path, 'utf8', function (err,data) {
                if(!data){
                    resolve([]);
                } else {
                    resolve(
                        that.getErrorsWithTime(data.match(that.logRegex))
                    );
                }
            });
        });
    }
    
    getLatestErrorsFromFile(path, logs){
        var that = this;
        if(!this.registeredLogs[path]) return logs;

        return logs.filter((logObject) => {
            if(!logObject.time) return false;
            
            return logObject.time > new Date(that.registeredLogs[path]);
        });
    }
    
    showErrorFromLogFile(path){
        var that = this;
        
        this.readFileErrors(path).then((logs) => {
            var errors = that.getLatestErrorsFromFile(path,logs);
            
            errors.forEach((error) => {
                that.displayError(path, error);
            });
        });
    }
    
    getErrorsWithTime(logs){
        var that = this;

        return logs.map((log) => {
            var time = that.getTimeOfLog(log);
            return {
                log: log,
                time: time ? new Date(time) : null
            }
        });
    }
    
    setLastErrorLog(path){
        var that = this;
        
        if(!this.registeredLogs[path]) {
            this.registeredLogs[path] = null;
        }
        
        this.readFileErrors(path).then((logs) => {
            that.getLatestErrorsFromFile(path,logs).forEach((error) => {
                if(error.time && that.registeredLogs[path] < error.time){
                    console.log("Last error",error.time);
                    that.registeredLogs[path] = error.time;
                }
            });
        });
    }
    
    displayError(path, error){
        var notifier = require('node-notifier'),
            that = this;
            
        notifier.notify({
          message: error.log.replace(new RegExp("\\[\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\] (\\w+.(ERROR|INFO)):",'g'),''),
          timeout: 10,
          actions: ['Show']
        }, function (err, response) {
            if(!that.registeredLogs[path]) {
                that.registeredLogs[path] = null;
            }

            if(error.time && that.registeredLogs[path] < error.time){
                that.registeredLogs[path] = error.time;
            }
            
            // Open file
            if(response == 'activate'){
                atom.workspace.open(path);
            }
        });
    }
    
    getTimeOfLog(log){
        var time = log.match(this.timeRegex);
        
        if(!time && time.length > 0){
            return null;
        }
        
        return time[0].slice(1, -1);
    }
}
