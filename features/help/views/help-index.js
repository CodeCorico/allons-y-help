(function() {
  'use strict';

  window.bootstrap([
    '$HelpService', '$ShortcutsService', '$i18nService', '$Page', '$done',
  function($HelpService, $ShortcutsService, $i18nService, $Page, $done) {

    var _helpButton = null,
        _helpShortcut = false;

    $Page.rightButtonAdd('help', {
      icon: 'i-question',
      group: 'group-help',
      ready: function(button) {
        _helpButton = button;
      },
      beforeGroup: function(context, $group, userBehavior, callback) {
        context.require('help-layout').then(function() {
          $HelpService.init({
            shortcut: _helpShortcut
          });

          _helpShortcut = false;

          callback();
        });
      }
    });

    $HelpService.onSafe('page.openHelp', function() {
      _helpButton.action();
    });

    $ShortcutsService.register(
      null,
      'help-f1',
      'F1',
      $i18nService._('Open the Help'),
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
