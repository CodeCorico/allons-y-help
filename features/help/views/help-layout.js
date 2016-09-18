(function() {
  'use strict';

  window.Ractive.controllerInjection('help-layout', [
    '$ShortcutsService', '$i18nService', '$Layout', '$HelpService', '$component', '$data', '$done',
  function helpLayoutController($ShortcutsService, $i18nService, $Layout, $HelpService, $component, $data, $done) {

    var HelpLayout = $component({
          data: $data
        }),
        _$el = {
          layout: $(HelpLayout.el),
          scrolls: $(HelpLayout.el).find('.help-layout > .pl-scrolls')
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

    $HelpService.onSafe('helpLayoutController.teardown', function() {
      HelpLayout.teardown();
      HelpLayout = null;
      $Layout.off('rightContextOpened', _rightContextOpened);
      _scrolls = null;

      setTimeout(function() {
        $HelpService.offNamespace('helpLayoutController');
      });
    });

    $HelpService.onSafe('helpLayoutController.updateScrolls', function() {
      _scrolls.update();
    });

    HelpLayout.require().then(function() {
      _scrolls = HelpLayout.findChild('name', 'pl-scrolls');

      var $firstSection = null;

      $(HelpLayout.el).find('.pl-section').each(function() {
        var $section = $(this),
            $header = $section.find('header'),
            $container = $section.find('.help-container'),
            $content = $container.find('.help-content'),
            forceOpen = false;

        $firstSection = $firstSection || $section;

        if (!$header.length || !$container.length || !$content.length) {
          return;
        }

        var $content = $container.find('.help-content');

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
            // $HelpService.updateWinChartCount(
            //   $section[0].className
            //     .replace('opened', '')
            //     .replace('pl-section', '')
            //     .replace('help-', '')
            //     .trim() + 'HelpSection'
            // );

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
          HelpLayout.on('open' + name, function() {
            forceOpen = true;
            $header.click();
          });
        }
      });

      $HelpService.onSafe('helpLayoutController.openSection', function(args) {
        HelpLayout.fire('open' + args.section);
      });

      if ($HelpService.openSection()) {
        HelpLayout.fire('open' + $HelpService.openSection());
      }

      $Layout.on('rightContextOpened', _rightContextOpened);

      $done();
    });

  }]);

})();
