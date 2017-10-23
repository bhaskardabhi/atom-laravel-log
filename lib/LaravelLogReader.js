'use babel';

export default class LaravelLogReader {
    
    
    constructor(width) {
        this.lastErrorTime = null;
        this.logRegex = new RegExp("\\[\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\] (\\w+.(ERROR|INFO)):*(.+)",'g');
        this.timeRegex = new RegExp("\\[\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\]",'g');
        this.typeRegex = new RegExp("(\w+.(ERROR|INFO))",'g');
        this.notificationType = {
            'INFO' : 'addFatalError',
            'ERROR' : 'addInfo',
        };
    }
    
    showErrorFromLogFile(path){
        var fs = require('fs');
        var _ = require('underscore'),
            that = this;
        
        return fs.readFile(path, 'utf8', function (err,data) {
            var logs = that.filterErrors(data.match(that.logRegex));
            
            _.each(logs, function(log){
                that.displayError(log);
            });
        });
    }
    
    filterErrors(logs){
        var _ = require('underscore'),
            that = this;
        
        return _.filter(logs, function(log){
            if(!that.lastErrorTime) return true;
            
            var time = that.getTimeOfLog(log);
            
            if(!time) return true;
            
            return that.lastErrorTime < new Date(time);
        });
    }
    
    displayError(log){
        var time = this.getTimeOfLog(log),
            updateLastErrorTime = this.lastErrorTime < new Date(time),
            notifier = require('node-notifier'),
            that = this,
            logText = log.replace(new RegExp("\\[\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\] (\\w+.(ERROR|INFO)):",'g'),'');
        
        notifier.notify({
          message: logText,
          timeout: 8
        }, function (err, response) {
            if(updateLastErrorTime){
                that.lastErrorTime = new Date(time);
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
    
    markOlderLogsAsRead(path){
        var fs = require('fs');
        var _ = require('underscore'),
            that = this;
        
        return fs.readFile(path, 'utf8', function (err,data) {
            var logs = that.filterErrors(data.match(that.logRegex));
            
            _.each(logs, function(log){
                var time = that.getTimeOfLog(log);
                
                if(that.lastErrorTime < new Date(time)){
                    that.lastErrorTime = new Date(time);
                }
            });
        });
    }
}
