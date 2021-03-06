define([
  "coreViews/componentView",
  "core/js/adapt"
], function(ComponentView, Adapt) {

  function waitFor(test, callback) {
    var intervalHandle = setInterval(function() {
      if (!test()) return;
      clearInterval(intervalHandle);
      callback();
    }, 250);
  }

  Adapt.once("app:dataReady", function() {
    // var courseConfig = Adapt.course.get("_brightcove");
    var firstComponentModel = Adapt.components.models.filter(function(model) {
      return model.get("_component") === "brightcove";
    });
    if(firstComponentModel.length == 0) return;
    firstComponentModel = firstComponentModel[0].attributes;
    var account = parseInt(firstComponentModel._accountId);
    var player = firstComponentModel._videoPlayer === undefined ? 'default' : firstComponentModel._videoPlayer;
    var script = "https://players.brightcove.net/" + account + "/" + player + "_default/index.min.js";
    var s = document.createElement('script');
    s.src = script;
    document.body.appendChild(s);
    var context = this;
    s.onload = function() {
      require(["bc"], function(bc) {
        window.bc = bc;
      });
    };
  });

  var Brightcove = ComponentView.extend({

    events: {
      "click .media-inline-transcript-button": "onToggleInlineTranscript",
      "click .brightcove-timestamp-item": "onTimestampClicked"
    },

    onToggleInlineTranscript: function(event) {
      if (event) event.preventDefault();
      setTimeout(function() {
        Adapt.trigger('Brightcove:openTranscript');
      }, 500);
      var $transcriptBodyContainer = this.$(".media-inline-transcript-body-container");
      var $buttonText = this.$(".media-inline-transcript-button .transcript-text-container");

      if ($transcriptBodyContainer.hasClass("inline-transcript-open")) {
        $transcriptBodyContainer.slideUp(function() {
          $(window).resize();
        });
        $transcriptBodyContainer.removeClass("inline-transcript-open");
        $buttonText.html(this.model.get("_transcript").inlineTranscriptButton);
      } else {
        $transcriptBodyContainer.slideDown(function() {
          $(window).resize();
        }).a11y_focus();
        $transcriptBodyContainer.addClass("inline-transcript-open");
        $buttonText.html(this.model.get("_transcript").inlineTranscriptCloseButton);
        if (this.model.get('_transcript')._setCompletionOnView !== false) {
          this.setCompletionStatus();
        }
      }
    },

    postRender: function() {
      var context = this;
      waitFor(function() {
        return window.bc;
      }, function() {
        context.setup();
        context.setReadyStatus();
      });
    },

    setup: function() {
      var eid = this.assignID(this.$('.brightcove-video-holder :first-child'));
      this.createPlayer(eid);
    },

    assignID: function() {
      var id = 'v' + Math.floor(Math.random() * (65535));
      this.$('.brightcove-video-holder :first-child').attr('id', id);
      return id;
    },

    setPreventControlBarHide: function(audioPlayer) {
      if (this.model.get("_preventControlBarHide") === "hide") {
        return false;
      } else if (this.model.get("_preventControlBarHide") === "show") {
        return true;
      } else {
        return !audioPlayer;
      }
    },

    setAudioPlayer: function() {
      this.$('.brightcove-video-holder').addClass('audio-player');
      this.$('.video-js').addClass('vjs-audio');
      if (this.model.get("_audioPlayer")._posterImage.length > 0) { // poster version of audio player
        this.$('.vjs-poster').removeClass('.vjs-hidden').css({
          "background-image": "url(" + this.model.get("_audioPlayer")._posterImage + ")",
          "display": "block"
        });
      } else { // minimal version of audio player
        this.$('.audio-player').addClass('minimal-audio-only');
      }
    },

    setVideoData: function(eID) {
      var vTag = document.getElementById(eID);
      vTag.setAttribute('data-account', this.model.get("_accountId"));
      vTag.setAttribute('data-player', this.model.get("_videoPlayer") === undefined ? 'default' : this.model.get("_videoPlayer"));
      vTag.setAttribute('data-video-id', this.model.get("_videoId"));
    },

    createPlayer: function(eID) {
      this.setVideoData(eID);
      bc(eID);
      var preventControlBarHide = this.setPreventControlBarHide(this.model.get("_audioPlayer")._isEnabled);
      this.videoRuntime(eID, preventControlBarHide);
    },

    onTimestampClicked: function(event) {
      event.preventDefault();
      var index = this.$(event.currentTarget).index() - 1;
      this.model.myPlayer.currentTime(this.model.get('_timestamp')._items[index]._time);
      this.model.myPlayer.play();
    },

    videoRuntime: function(eID, preventControlBarHide) {
      var context = this;
      var completionOn = this.model.get("_setCompletionOn") === undefined ? 'play' : this.model.get("_setCompletionOn");

      if (this.model.get("_audioPlayer")._isEnabled) {
        this.setAudioPlayer();
      }

      this.model.myPlayer = videojs(eID);

      this.model.myPlayer.on('loadedmetadata', function() {
        this.on('play', function() {
          if (completionOn === 'play')
            context.setCompletionStatus();
        });

        this.on('userinactive', function() {
          if (preventControlBarHide)
            context.$('.video-js').removeClass('vjs-user-inactive').addClass('vjs-user-active');
        });

        this.on('ended', function() {
          if (completionOn === 'ended')
            context.setCompletionStatus();
        });
      });
    }
  });

  Adapt.register("brightcove", Brightcove);
  return Brightcove;
});
