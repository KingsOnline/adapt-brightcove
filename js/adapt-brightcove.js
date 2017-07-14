define([
  "coreViews/componentView",
  "core/js/adapt"
], function(ComponentView, Adapt) {


  var Brightcove = ComponentView.extend({

    events: {
      "click .media-inline-transcript-button": "onToggleInlineTranscript"
    },

    onToggleInlineTranscript: function(event) {
      if (event) event.preventDefault();
      var $transcriptBodyContainer = this.$(".media-inline-transcript-body-container");
      var $button = this.$(".media-inline-transcript-button");

      if ($transcriptBodyContainer.hasClass("inline-transcript-open")) {
        $transcriptBodyContainer.slideUp(function() {
          $(window).resize();
        });
        $transcriptBodyContainer.removeClass("inline-transcript-open");
        $button.html(this.model.get("_transcript").inlineTranscriptButton);
      } else {
        $transcriptBodyContainer.slideDown(function() {
          $(window).resize();
        }).a11y_focus();
        $transcriptBodyContainer.addClass("inline-transcript-open");
        $button.html(this.model.get("_transcript").inlineTranscriptCloseButton);
        if (this.model.get('_transcript')._setCompletionOnView !== false) {
          this.setCompletionStatus();
        }
      }
    },

    postRender: function() {
      var account = parseInt(this.model.get("_accountId"));
      var player = this.model.get("_videoPlayer") === undefined ? 'default' : this.model.get("_videoPlayer");
      var script = "https://players.brightcove.net/" + account + "/" + player + "_default/index.min.js";
      var s = document.createElement('script');
      s.src = script;
      var e = document.getElementsByClassName(this.model.get("_id"));
      e[0].appendChild(s);
      var context = this;
      s.onload = function() {
        require(["bc"], function(bc) {
          window.bc = bc;
          context.setup();
          context.setReadyStatus();
        });
      };
      s.onerror = function() {
        console.log('cannot load Brightcove');
        context.setReadyStatus();
        context.setCompletionStatus();
      };
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

    videoRuntime: function(eID, preventControlBarHide) {
      var context = this;
      var completionOn = this.model.get("_setCompletionOn") === undefined ? 'play' : this.model.get("_setCompletionOn");

      if (this.model.get("_audioPlayer")._isEnabled) {
        this.setAudioPlayer();
      }


      var myPlayer = videojs(eID).on('loadedmetadata', function() {
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
