'use strict';

module.exports = function($processIndex, $allonsy, $glob, EntityModel, $done) {
  if ($processIndex !== 0) {
    return $done();
  }

  var fs = require('fs'),
      path = require('path');

  require(path.resolve(__dirname, 'web-help-service.js'))();

  var $WebHelpService = DependencyInjection.injector.model.get('$WebHelpService');

  EntityModel
    .findOrCreate({
      entityType: 'helpVersions'
    })
    .exec(function(err, entity) {
      var updateNeeded = false;

      if (!entity.createdAt) {
        updateNeeded = true;

        entity.isSearchable = false;
        entity.isSearchableAdvanced = false;
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        entity.version = 0;
        entity.modules = {};
      }

      var files = $allonsy
          .globPatterns('')
          .map(function(pattern) {
            return pattern.split('features/')[0] + 'CHANGELOG_ENDUSER.md';
          }),
          newChangelog = [];

      files.forEach(function(file) {
        if (!fs.existsSync(file)) {
          return;
        }

        var content = fs.readFileSync(file, 'utf-8').split('\n'),
            moduleName = null,
            version = null,
            text = [];

        for (var i = 0; i < content.length; i++) {
          var line = content[i];

          if (line.indexOf('# ') === 0) {
            moduleName = line.replace('# ', '').trim();
          }
          else if (line.indexOf('## ') === 0) {
            version = version || line.replace('## ', '').trim();

            if (entity.modules[moduleName] && entity.modules[moduleName] == version) {
              break;
            }
          }
          else if (version && line) {
            text.push(line);
          }
        }

        if (text.length) {
          text = text
            .join('<br />')
            .trim()
            .replace(/\*\*(.*?)\*\*/g, function(string, words) {
              return '<strong>' + words + '</strong>';
            })
            .replace(/_(.*?)_/g, function(string, words) {
              return '<span class="italic">' + words + '</span>';
            })
            .replace(/\[(.*?)\]\((.*?)\)/g, function(string, words, link) {
              return '<a href="' + link + '" target="_blank">' + words + '</a>';
            });

          if (entity.modules[moduleName]) {
            newChangelog.push(text);
          }

          entity.modules[moduleName] = version;
        }
      });

      if (!newChangelog.length && !updateNeeded) {
        $WebHelpService.changelog(entity.changelog, entity.version, entity.updatedAt);

        return $done();
      }

      entity.updatedAt = new Date();
      entity.changelog = newChangelog.join('<br />');
      entity.version++;

      $WebHelpService.changelog(entity.changelog, entity.version, entity.updatedAt);

      EntityModel
        .update({
          entityType: 'helpVersions'
        }, entity)
        .exec(function() {
          $done();
        });
    });
};
