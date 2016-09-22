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

    Object.keys(descriptions).forEach(function(name) {
      var descs = descriptions[name];

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
