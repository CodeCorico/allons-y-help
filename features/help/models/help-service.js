module.exports = function() {
  'use strict';

  DependencyInjection.service('$HelpService', ['$i18nService', '$AbstractService', function($i18nService, $AbstractService) {

    return new (function $HelpService() {

      $AbstractService.call(this);

      var _this = this,
          _openSection = null;

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

      this.openSection = function(newValue) {
        if (typeof newValue != 'undefined') {
          _this.openHelp(function() {
            _openSection = newValue;

            _this.fire('openSection', {
              section: newValue
            });
          });

          return _this;
        }

        return _openSection;
      };

    })();

  }]);

};
