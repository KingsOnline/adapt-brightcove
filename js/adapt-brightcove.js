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
            e.attr('data-account', 4629028765001); // hard coded for King's College but we can make this an option if we open source this.
            var player = this.model.get("_videoPlayer") === undefined ? 'default' : this.model.get("_videoPlayer");
            e.attr('data-player', player);
            bc(eID);

            var context = this;
            var CompletionOn = this.model.get("_setCompletionOn");

            var myPlayer = videojs(eID, {}, function() {

                this.on('play', function() {
                  if(CompletionOn === 'play')
                    context.setCompletionStatus();
                });

                this.on('pause', function() {
                });

                this.on('ended', function() {
                    if(CompletionOn === 'ended')
                    context.setCompletionStatus();
                });
            });
        }
    });

    Adapt.register("brightcove", Brightcove);
    return Brightcove;

});
