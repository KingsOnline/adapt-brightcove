define([
  "coreViews/componentView", "core/js/adapt", "./adapt-google-analytics"
], function(ComponentView, Adapt, googleAnalytics) {

  function waitFor(test, callback) {
    var intervalHandle = setInterval(function() {
      if (!test())
        return;
      clearInterval(intervalHandle);
      callback();
    }, 250);
  }

  Adapt.once("app:dataReady", function() {
    var firstComponentModel = Adapt.components.models.filter(function(model) {
      return model.get("_component") === "brightcove";
    });
    if (firstComponentModel.length === 0)
      return;
    firstComponentModel = firstComponentModel[0].attributes;
    var partnerId = parseInt(firstComponentModel._partnerId);
    var playerId = parseInt(firstComponentModel._playerId);
    var script = "//cdnapisec.kaltura.com/p/" + partnerId + "/sp/" + partnerId + "00/embedIframeJs/uiconf_id/" + playerId + "/partner_id/" + partnerId;
    var s = document.createElement('script');
    s.src = script;
    document.body.appendChild(s);
  });

  var Brightcove = ComponentView.extend({

    captionsBelow: false,
    hasAutoPlayed: false,

    events: {
      "click .media-inline-transcript-button": "onToggleInlineTranscript",
      "click .kaltura-timestamp-item": "onTimestampClicked",
      "click .media-external-transcript-button": "openExternalTranscript"
    },

    openExternalTranscript: function(event) {
      event.preventDefault();
      if (!googleAnalytics) return;
      googleAnalytics.kalturaExternalTranscript(this.model.get('_entryId'));
    },

    onToggleInlineTranscript: function(event) {
      if (event)
        event.preventDefault();
      if (googleAnalytics) {
        googleAnalytics.kalturaInlineTranscript(this.model.get('_entryId'));
      }

      var $transcriptBodyContainer = this.$(".media-inline-transcript-body-container");
      var $buttonText = this.$(".media-inline-transcript-button .transcript-text-container");
      var $transcriptIcon = this.$(".view-transcript-icon");

      if ($transcriptBodyContainer.hasClass("inline-transcript-open")) {
        $transcriptBodyContainer.slideUp(function() {
          $(window).resize();
        });
        $transcriptBodyContainer.removeClass("inline-transcript-open");
        $transcriptIcon.removeClass('open');
        $buttonText.html(this.model.get("_transcript").inlineTranscriptButton);
      } else {
        $transcriptBodyContainer.slideDown(function() {
          $(window).resize();
        }).a11y_focus();
        $transcriptBodyContainer.addClass("inline-transcript-open");
        $buttonText.html(this.model.get("_transcript").inlineTranscriptCloseButton);
        $transcriptIcon.addClass('open');
        if (this.model.get('_transcript')._setCompletionOnView !== false) {
          this.setCompletionStatus();
        }
      }
    },

    postRender: function() {
      if (this.model.get('_captions') && this.model.get('_captions')._isEnabled && this.model.get('_captions')._layout === "below") {
        this.captionsBelow = true;
        $(this.el).find('.kaltura-video-holder').addClass('captions-below');
      }
      var context = this;
      waitFor(function() {
        return window.kWidget;
      }, function() {
        context.createPlayer();
        context.setReadyStatus();
        context.setupOnScreen();
      });
    },

    setupOnScreen: function() {
      if (!this.model.get("_pictureInPicture")._isEnabled && !this.model.get("_autoPlayOnScreen")._isEnabled)
        return;
      var $this = $(this.el);
      var pip = this.model.get("_pictureInPicture");
      var autoPlay = this.model.get('_autoPlayOnScreen');
      var hasAutoPlayed = this.hasAutoPlayed;
      var playTrigger = 'kaltura:play' + this.model.get('_entryId');
      var pauseTrigger = 'kaltura:pause' + this.model.get('_entryId');

      $($this).on('inview', function(event, isInView, visiblePartX, visiblePartY) {
        if (visiblePartY == 'top') {
          // top part of element is visible
        } else if (visiblePartY == 'bottom') {
          // bottom part of element is visible
        } else {
          if (isInView) {
            if (pip._isEnabled) {
              $($this).addClass('inview');
            }

            if (autoPlay._isEnabled && (autoPlay._options._playOnScreen || autoPlay._options._playOnReturn)) {
              if (autoPlay._options._playOnReturn || !hasAutoPlayed) {
                Adapt.trigger(playTrigger);
                hasAutoPlayed = true;
              }
            }
          } else {
            if (pip._isEnabled) {
              $($this).removeClass('inview');
            }
            if (autoPlay._isEnabled && autoPlay._options._pauseOffScreen) {
              Adapt.trigger(pauseTrigger);
            }
          }
        }
      });
    },

    createPlayer: function() {
      var context = this;
      var $video = $(this.el).find('.kaltura-video-holder');
      kWidget.embed({
        'targetId': this.model.get("_entryId"),
        'wid': '_' + parseInt(this.model.get("_partnerId")),
        'uiconf_id': parseInt(this.model.get("_playerId")),
        'entry_id': this.model.get("_entryId"),
        'flashvars': { // flashvars allows you to set runtime uiVar configuration overrides.
          'autoPlay': false,
          'infoScreen.plugin': 'false',
          'titleLabel.plugin': 'false',
          'related.plugin': 'false',
          "playbackRateSelector": {
            "plugin": true,
            "position": "after",
            "loadingPolicy": "onDemand",
            "defaultSpeed": "1",
            "speeds": ".5,.75,1,1.5,2",
            "relativeTo": "PlayerHolder"
          },
          'closedCaptions': {
            'layout': this.model.get('_captions')._layout,
            'useCookie': true,
            'defaultLanguageKey': 'en',
            'fontsize': 12,
            'bg': '0x000000',
            'fontFamily': 'Arial',
            'fontColor': '0xFFFFFF',
            'useGlow': 'false',
            'glowBlur': 4,
            'glowColor': '0x133693'
          }
        },
        'params': { // params allows you to set flash embed params such as wmode, allowFullScreen etc
          'wmode': 'transparent'
        },
        readyCallback: function(entryId) {
          var kdp = document.getElementById(entryId);
          var playTrigger = 'kaltura:play' + context.model.get('_entryId');
          var pauseTrigger = 'kaltura:pause' + context.model.get('_entryId');

          kdp.kBind('kdpReady', function() {
            googleAnalytics.kalturaLoaded(context.model.get('_entryId'));
          });

          kdp.kBind('replay', function() {
            googleAnalytics.kalturaReplay(context.model.get('_entryId'));
          });

          kdp.kBind('firstPlay', function() {
            context.videoFirstPlay();
            googleAnalytics.kalturaFirstPlay(context.model.get('_entryId'));
            if (!context.model.get('_captions')._alwaysHideAtStart) {
              kdp.sendNotification("hideClosedCaptions");
            }
          });

          kdp.kBind('doPlay', function() {
            context.pauseOtherVideos(context.model.get("_entryId"));
            if (this.model.get('_pictureInPicture') && this.model.get('_pictureInPicture')._isEnabled) {
              $(context.el).addClass('playing');
            }
          });

          kdp.kBind('doPause', function() {
            if (this.model.get('_pictureInPicture') && this.model.get('_pictureInPicture')._isEnabled) {
              $(context.el).removeClass('playing');
            }
          });

          kdp.kBind('changedClosedCaptions', function(event) {
            if (context.captionsBelow) {
              $($video).addClass('captions-below');
            }
          });

          kdp.kBind('closedCaptionsHidden', function() {
            if (context.captionsBelow) {
              $($video).removeClass('captions-below');
            }
          });

          kdp.kBind('updatedPlaybackRate', function(newRate) {
            googleAnalytics.kalturaChangePlaybackRate(newRate, context.model.get('_entryId'));
          });

          kdp.kBind('hasOpenedFullScreen', function() {
            googleAnalytics.kalturaFullscreen(context.model.get('_entryId'));
          });

          kdp.kBind('firstQuartile', function() {
            googleAnalytics.kalturaComplete('25', context.model.get('_entryId'));
          });

          kdp.kBind('secondQuartile', function() {
            googleAnalytics.kalturaComplete('50', context.model.get('_entryId'));
          });

          kdp.kBind('thirdQuartile', function() {
            googleAnalytics.kalturaComplete('75', context.model.get('_entryId'));
          });

          kdp.kBind('playerPlayEnd', function() {
            context.videoFinished();
            googleAnalytics.kalturaComplete(context.model.get('_entryId'));
          });

          kdp.kBind('ccDisplayed', function(event) {
            if (context.captionsBelow) {
              $($video).addClass('captions-below');
            }
          });

          Adapt.on(playTrigger, function() {
            kdp.sendNotification('doPlay');
          })

          Adapt.on(pauseTrigger, function() {
            kdp.sendNotification('doPause');
          })
        }
      });
    },

    pauseOtherVideos: function(entryId) {
      if (!this.model.get("_singlePlayingVideo"))
        return;
      var context = this;
      var currentPageModel = Adapt.contentObjects._byAdaptID[Adapt.location._currentId][0];
      var kalturaModels = currentPageModel.findDescendants('components').filter(function(model) {
        if (model.get("_component") === "brightcove" && model.get("_entryId") !== entryId) {
          context.pauseVideo(model.get("_entryId"));
        }
      });
    },

    pauseVideo: function(entryId) {
      var kdp = document.getElementById(entryId);
      kdp.sendNotification("doPause");
    },

    seekTo: function(timestamp, entryId) {
      var kdp = document.getElementById(entryId);
      kdp.sendNotification("doSeek", this.model.get("_timestamp")._items[timestamp]._time);
    },

    videoFirstPlay: function() {
      if (this.model.get('_setCompletionOn') === "play") {
        this.setCompletionStatus();
      }
    },

    videoFinished: function() {
      this.setCompletionStatus();
    },

    onTimestampClicked: function(event) {
      event.preventDefault();
      var index = this.$(event.currentTarget).index() - 1;
      this.seekTo(index, this.model.get('_entryId'));
    }
  });

  Adapt.register("brightcove", Brightcove);
  return Brightcove;
});
