(function() {
  'use strict';

  window.Ractive.controllerInjection('web-help-layout', [
    '$ShortcutsService', '$i18nService', '$Layout', '$WebHelpService', '$component', '$data', '$done',
  function webHelpLayoutController($ShortcutsService, $i18nService, $Layout, $WebHelpService, $component, $data, $done) {

    var WebHelpLayout = $component({
          data: $data
        }),
        _$el = {
          layout: $(WebHelpLayout.el),
          scrolls: $(WebHelpLayout.el).find('.web-help-layout > .pl-scrolls')
        },
        _scrolls = null;

    function _rightContextOpened(args) {
      if (!args.opened) {
        return;
      }

      setTimeout(function() {
        if (!_scrolls) {
          return;
        }

        _scrolls.update();
      }, 1200);
    }

    $WebHelpService.onSafe('webHelpLayoutController.teardown', function() {
      WebHelpLayout.teardown();
      WebHelpLayout = null;
      $Layout.off('rightContextOpened', _rightContextOpened);
      _scrolls = null;

      setTimeout(function() {
        $WebHelpService.offNamespace('webHelpLayoutController');
      });
    });

    $WebHelpService.onSafe('webHelpLayoutController.updateScrolls', function() {
      _scrolls.update();
    });

    WebHelpLayout.require().then(function() {
      _scrolls = WebHelpLayout.findChild('name', 'pl-scrolls');

      var $firstSection = null;

      $(WebHelpLayout.el).find('.pl-section').each(function() {
        var $section = $(this),
            $header = $section.find('header'),
            $container = $section.find('.web-help-container'),
            $content = $container.find('.web-help-content'),
            forceOpen = false;

        $firstSection = $firstSection || $section;

        if (!$header.length || !$container.length || !$content.length) {
          return;
        }

        var $content = $container.find('.web-help-content');

        $header.click(function() {
          var fromForceOpen = forceOpen;
          forceOpen = false;

          if (!fromForceOpen && $container.hasClass('opened')) {
            $container
              .css('height', $content.outerHeight())
              .removeClass('opened');

            setTimeout(function() {
              $container.css('height', 0);

              setTimeout(function() {
                _scrolls.update();
              }, 350);
            });
          }
          else {
            $container.css('height', $content.outerHeight());

            setTimeout(function() {
              $container
                .addClass('opened')
                .css('height', '');

              _scrolls.update();

              if (fromForceOpen) {
                _$el.scrolls.animate({
                  scrollTop: $section.offset().top - $firstSection.offset().top
                }, 350);

              }
            }, 350);
          }
        });

        var name = $section.attr('name');

        if (name) {
          WebHelpLayout.on('open' + name, function() {
            forceOpen = true;
            $header.click();
          });
        }
      });

      $WebHelpService.onSafe('webHelpLayoutController.openSection', function(args) {
        WebHelpLayout.fire('open' + args.section);
      });

      if ($WebHelpService.openSection()) {
        WebHelpLayout.fire('open' + $WebHelpService.openSection());
      }

      $Layout.on('rightContextOpened', _rightContextOpened);

      $done();
    });

  }]);

})();
