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
            e.attr('data-player', 'default'); // hard coded for King's College but we can make this an option if we open source this.
            bc(eID);

            var context = this;

            var myPlayer = videojs(eID, {}, function() {

                this.on('play', function() {
                    console.log('playing');
                });

                this.on('pause', function() {
                    console.log('pausing');
                });

                this.on('ended', function() {
                    console.log('ended');
                    context.setCompletionStatus();
                });
            });
        }
    });

    Adapt.register("brightcove", Brightcove);
    return Brightcove;

});
