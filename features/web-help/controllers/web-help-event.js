'use strict';

module.exports = [{
  event: 'call(web-help/changelog)',
  controller: function($WebHelpService, $socket) {
    $socket.emit('read(web-help/changelog)', {
      changelog: $WebHelpService.changelog()
    });
  }
}];
