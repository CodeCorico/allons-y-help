(function() {
  'use strict';

  window.Ractive.controllerInjection('help-shortcuts', [
    '$ShortcutsService', '$component', '$data', '$done',
  function helpShortcutsController($ShortcutsService, $component, $data, $done) {

    var defaultGroup = $ShortcutsService.defaultGroup(),
        descriptions = $ShortcutsService.descriptions();

    $data.groups = [{
      name: defaultGroup,
      descriptions: descriptions[defaultGroup]
    }];

    $.each(descriptions, function(name, descs) {
      if (name == defaultGroup || !descs || !descs.length) {
        return;
      }

      $data.groups.push({
        name: name,
        descriptions: descs
      });
    });

    $component({
      data: $data
    });

    $done();

  }]);

})();
