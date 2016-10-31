(function() {
  'use strict';

  window.bootstrap([
    '$BodyDataService', '$WebHelpService', '$ShortcutsService', '$i18nService', '$Page', '$done',
  function($BodyDataService, $WebHelpService, $ShortcutsService, $i18nService, $Page, $done) {

    var _helpButton = null,
        _helpShortcut = false;

    $Page.rightButtonAdd('web-help', {
      type: 'indicator',
      image: '/public/web-help/web-help-button.png',
      group: 'group-web-help',
      ready: function(button) {
        _helpButton = button;

        var helpCookie = window.Cookies.getJSON('web.help') || {},
            helpChangelog = $BodyDataService.data('web').changelog;

        if (!helpChangelog || !helpChangelog.version) {
          return;
        }

        if (
          !helpCookie || !helpCookie.changelog || !helpCookie.changelog.version ||
          helpChangelog.version != helpCookie.changelog.version
        ) {
          _helpButton.set('notificationsCount', 1);
        }
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
