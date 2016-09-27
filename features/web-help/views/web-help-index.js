(function() {
  'use strict';

  window.bootstrap([
    '$WebHelpService', '$ShortcutsService', '$i18nService', '$Page', '$done',
  function($WebHelpService, $ShortcutsService, $i18nService, $Page, $done) {

    var _helpButton = null,
        _helpShortcut = false;

    $Page.rightButtonAdd('web-help', {
      icon: 'i-question',
      group: 'group-web-help',
      ready: function(button) {
        _helpButton = button;
      },
      beforeGroup: function(context, $group, userBehavior, callback) {
        context.require('web-help-layout').then(function() {
          $WebHelpService.init({
            shortcut: _helpShortcut
          });

          _helpShortcut = false;

          callback();
        });
      }
    });

    $WebHelpService.onSafe('page.openHelp', function() {
      _helpButton.action();
    });

    $ShortcutsService.register(
      null,
      'web-help-f1',
      'F1',
      $i18nService._('Open the Help context'),
      function(e) {
        // F1
        var isShortcut = e.keyCode == 112 && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey;

        if (isShortcut) {
          e.preventDefault();
          e.stopPropagation();
        }

        return isShortcut;
      },
      function() {
        _helpShortcut = true;
        _helpButton.action(true);
      }
    );

    $done();
  }]);

})();
