module.exports = function() {
  'use strict';

  DependencyInjection.service('$WebHelpService', [
    '$i18nService', '$AbstractService',
  function($i18nService, $AbstractService) {

    return new (function $WebHelpService() {

      $AbstractService.call(this);

      var _this = this,
          _changelog = null;

      this.openHelp = function(callback) {
        if (_this.isInit()) {
          _this.fire('openHelp');

          if (callback) {
            callback();
          }
        }
        else {
          _this.onSafe('helpTemp.init', function() {
            setTimeout(function() {
              _this.offNamespace('helpTemp');
            });

            if (callback) {
              callback();
            }
          });

          _this.fire('openHelp');
        }
      };

      this.changelog = function(changelog, version, updatedAt) {
        if (!changelog) {
          return _changelog;
        }

        _changelog = {
          content: changelog,
          version: version,
          updatedAt: updatedAt
        };

        var $BodyDataService = DependencyInjection.injector.service.get('$BodyDataService'),
            web = $BodyDataService.data(null, 'web') || {};

        web.changelog = {
          version: version
        };

        $BodyDataService.data(null, 'web', web);

        return _this;
      };

      this.changelogVersion = function() {
        return _changelog && _changelog.version || null;
      };

    })();

  }]);

};
