define(function(require) {

    var ComponentView = require("coreViews/componentView");
    var Adapt = require("coreJS/adapt");
    var brightcove = require('components/adapt-brightcove/js/brightcove');

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

        assignID: function() {
            var id = 'v' + Math.floor(Math.random() * (65535 - 0) + 0);
            this.$('.brightcove-video-holder :first-child').attr('id', id);
        },

        postRender: function() {
            this.assignID();
            this.createPlayer();
            this.setReadyStatus();
        },



        createPlayer: function() {
            var e = this.$('.brightcove-video-holder :first-child');
            e.attr('data-video-id', this.model.get("_videoId"));
            e.attr('data-account', 4629028765001); // hard coded for King's College but we can make this an option if we open source this.
            e.attr('data-player', 'default'); // hard coded for King's College but we can make this an option if we open source this.
            var eID = e.attr('id');
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
            console.log('myplayer');
            console.log(myPlayer);
        }

    });

    Adapt.register("brightcove", Brightcove);
    return Brightcove;

});
