'use babel';

import LaravelLogReader from './LaravelLogReader';
import { CompositeDisposable } from 'atom';

export default {
  laravelLogReader: null,
  subscriptions: null,

  activate(state) {
	var that = this;
    this.laravelLogReader = new LaravelLogReader();
    
    this.subscriptions = atom.project.onDidChangeFiles(events => {
      for (const event of events) {
          var path = event.path,
            action = event.action;
          
          if(this.isLogFile(path) && (action == 'created' || action == 'modified')){
              this.laravelLogReader.showErrorFromLogFile(path);
         }
     }
    });
  },

  deactivate() {
    this.subscriptions.dispose();
    this.laravelLogReader.destroy();
  },

  serialize() {
    return {};
  },

  toggle() {
      this.markOlderLogsAsRead();
  },
  
  isLogFile(path){
      let filename = path.replace(/^.*[\\\/]/, '');
      
      return filename == 'laravel.log' || filename == "laravel-"+this.getCurrentDate()+".log";
  },
  
  getLoggerFiles(rootDirectory) {
    return [
        rootDirectory.path+"/storage/logs/laravel.log",
        rootDirectory.path+"/storage/logs/laravel-"+this.getCurrentDate()+".log"
    ];
  },
  
  getCurrentDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
   },
};
