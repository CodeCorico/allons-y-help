(function() {
  'use strict';

  window.Ractive.controllerInjection('web-help-layout', [
    '$Page', '$BodyDataService', '$ShortcutsService', '$WebHelpService', '$Layout', '$socket', '$component', '$data', '$done',
  function webHelpLayoutController(
    $Page, $BodyDataService, $ShortcutsService, $WebHelpService, $Layout, $socket, $component, $data, $done
  ) {

    var _defaultGroup = $ShortcutsService.defaultGroup(),
        _descriptions = $ShortcutsService.descriptions(),
        _helpChangelog = $.extend(true, {}, $Page.get('web').changelog || {});

    $data.groups = [{
      name: _defaultGroup,
      descriptions: _descriptions[_defaultGroup]
    }];

    Object.keys(_descriptions).forEach(function(name) {
      var descs = _descriptions[name];

      if (name == _defaultGroup || !descs || !descs.length) {
        return;
      }

      $data.groups.push({
        name: name,
        descriptions: descs
      });
    });

    var WebHelpLayout = $component({
      data: $.extend(true, {
        opened: false,
        user: $BodyDataService.data('web')
      }, $data)
    });

    function _callChangelog() {
      $socket.emit('call(web-help/changelog)');
    }

    $socket.on('read(web-help/changelog)', function(args) {
      if (!args || !args.changelog) {
        return;
      }

      args.changelog.date = window.moment(args.changelog.updatedAt).format('MMMM Do YYYY, hh:mm:ss');
      args.changelog.dateAgo = window.moment(args.changelog.updatedAt).fromNow();

      WebHelpLayout.set('changelog', args.changelog);

      if (_helpChangelog.version && args.changelog.version != _helpChangelog.version) {
        _helpChangelog.version = args.changelog.version;

        WebHelpLayout.set('needRefresh', true);

        _confetti(_helpChangelog.version);
      }
    });

    $socket.on('reconnect', function() {
      _callChangelog();
    });

    _callChangelog();

    $WebHelpService.onSafe('webHelpLayoutController.teardown', function() {
      WebHelpLayout.teardown();
      WebHelpLayout = null;
      $Layout.rightContext().off('open', _rightContextOpened);
      $Layout.rightContext().off('close', _rightContextClosed);

      setTimeout(function() {
        $WebHelpService.offNamespace('webHelpLayoutController');
      });
    });

    function _rightContextOpened() {
      if (WebHelpLayout.get('opened')) {
        return;
      }

      var helpCookie = window.Cookies.getJSON('web.help') || {};

      if (!_helpChangelog.version) {
        return;
      }

      if (
        !helpCookie || !helpCookie.changelog || !helpCookie.changelog.version ||
        _helpChangelog.version != helpCookie.changelog.version
      ) {
        _confetti(_helpChangelog.version);
      }
    }

    function _rightContextClosed() {
      _removeConfetti();
    }

    function _random(a, b) {
      return Math.floor(Math.random() * (b - a + 1)) + a;
    }

    function _removeConfetti() {
      $($Layout.rightContext().el).find('.pl-context-panel').find('.web-help-particle').remove();

      if (WebHelpLayout) {
        WebHelpLayout.set('confetti', false);
      }
    }

    function _confetti(version) {
      window.Cookies.set('web.help', {
        changelog: {
          version: version
        }
      }, {
        expires: 365,
        path: '/'
      });

      WebHelpLayout.set('confetti', true);

      var $contextPanel = $($Layout.rightContext().el).find('.pl-context-panel'), //.find('.web-help-news'),
          confetticount = ($contextPanel.outerWidth() / 50) * 10;

      for (var i = 0; i <= confetticount; i++) {
        $contextPanel.append([
          '<span ',
            'class="web-help-particle c', _random(1, 2), '" ',
            'style="',
              'top:', _random(110, 260), 'px; left:', _random(0, 100), '%; width:', _random(6, 8), 'px; ',
              'height:', _random(3, 4), 'px; animation-delay: ', (_random(0, 30) / 10), 's;',
            '"',
          '></span>'
        ].join(''));
      }

      setTimeout(_removeConfetti, (1750 + 3000) * 3);
    }

    $Layout.rightContext().on('open', _rightContextOpened);
    $Layout.rightContext().on('close', _rightContextClosed);

    WebHelpLayout.require().then($done);

  }]);

})();
