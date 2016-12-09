define([
    "coreViews/componentView",
    "core/js/adapt"
], function(ComponentView, Adapt) {
    $("head").append('<script>$.getScript("https://players.brightcove.net/4629028765001/default_default/index.min.js", function() { require(["bc"], function(bc) { window.bc = bc; }); });</script>');

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
            var e = this.$('.brightcove-video-holder :first-child');
            var eid = this.assignID(e);
            this.createPlayer(e, eid);
            this.setReadyStatus();
        },

        assignID: function() {
            var id = 'v' + Math.floor(Math.random() * (65535));
            this.$('.brightcove-video-holder :first-child').attr('id', id);
            return id;
        },

        createPlayer: function(e, eID) {
            e.attr('data-video-id', this.model.get("_videoId"));
            e.attr('data-account', this.model.get("_accountId"));
            var player = this.model.get("_videoPlayer") === undefined ? 'default' : this.model.get("_videoPlayer");
            var audioPlayer = this.model.get("_audioOnly") === undefined ? false : this.model.get("_audioOnly");

            var preventControlBarHide;
            if(this.model.get("_preventControlBarHide") === "hide") {
              preventControlBarHide = false;
            } else if (this.model.get("_preventControlBarHide") === "show") {
              preventControlBarHide = true;
            } else {
              preventControlBarHide = audioPlayer;
            }

            e.attr('data-player', player);
            bc(eID);
            console.log(this.model.get("_posterImage"));
            if(audioPlayer) {
              this.$('.brightcove-video-holder').addClass('audio-player');
              this.$('.video-js').addClass('vjs-audio');
              if(this.model.get("_posterImage").length > 0){ // poster version of audio player
                console.log('has poster');
                this.$('.vjs-poster').removeClass('.vjs-hidden').css({"background-image":"url("+ this.model.get("_posterImage") +")", "display":"block"})
              } else { // minimal version of audio player
                console.log('minimal');
                this.$('.audio-player').addClass('minimal-audio-only');
              }
            }

            var context = this;
            var completionOn = this.model.get("_setCompletionOn") === undefined ? 'play' : this.model.get("_setCompletionOn");
            var myPlayer = videojs(eID, {}, function() {

                this.on('play', function() {
                    if (completionOn === 'play')
                        context.setCompletionStatus();
                });

                this.on('userinactive', function(){
                  if(preventControlBarHide)
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
