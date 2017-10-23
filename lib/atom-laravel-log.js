'use babel';

import LaravelLogReader from './LaravelLogReader';
import { CompositeDisposable } from 'atom';

export default {

  laravelLogReader: null,
  subscriptions: null,
  watchers: {},

  activate(state) {
	var that = this;
    this.laravelLogReader = new LaravelLogReader();

    // Register command that toggles this view
    console.log('auto active');
        atom.project.onDidChangePaths(function(){
            console.log(arguments);
            
          that.cancelExistingWatchers();
          that.markOlderLogsAsRead();
          that.runWatchers();
        });
      this.cancelExistingWatchers();
      this.markOlderLogsAsRead();
      this.runWatchers();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.laravelLogReader.destroy();
    this.cancelExistingWatchers();
  },

  serialize() {
    return {
    };
  },

  toggle() {
      this.markOlderLogsAsRead();
      this.cancelExistingWatchers();
      this.runWatchers();
  },
  
  projectChanged(){
      this.markOlderLogsAsRead();
      this.cancelExistingWatchers();
      this.runWatchers();
  },
  
  markOlderLogsAsRead(){
      var _ = require('underscore'),
          fs = require('fs'),
          that = this;
      
      _.each(atom.workspace.project.rootDirectories, function(rootDirectory){
          var path = rootDirectory.path+"/storage/logs/laravel.log";
          
          if (fs.existsSync(path)) {
              that.laravelLogReader.markOlderLogsAsRead(path);
          }
      });  
  },
  
  runWatchers(){
      var _ = require('underscore'),
          fs = require('fs'),
          that = this;
      
      _.each(atom.workspace.project.rootDirectories, function(rootDirectory){
          var path = rootDirectory.path+"/storage/logs/laravel.log";
          
          if (fs.existsSync(path)) {
              that.watchers[path] = fs.watch(path, function(){
                  that.laravelLogReader.showErrorFromLogFile(path);
              });
          }
      });
  },
  
  cancelExistingWatchers(){
    var _ = require('underscore'),
        that = this;
    
      _.each(that.watchers,function(watcher, path){
        watcher.close();
        delete that.watchers[path];
      });
  }

};
