'use babel';

export default class AtomLaravelLogView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-laravel-log');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The AtomLaravelLog package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
    this.getErrors();
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
  
    getErrors()
    {
        fs = require('fs');
        var file = atom.workspace.project.rootDirectories[0].path+"/storage/logs/laravel.log";
        
        fs.readFile(file, 'utf8', function (err,data) {
            var logs = data.match(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] (\w+.(ERROR|INFO)):*(.+)/g);
            
            for(var i = 0; i < (logs.length - 1);i++){
                atom.notifications.addSuccess(logs[i]);
            }
        });
    }

}
