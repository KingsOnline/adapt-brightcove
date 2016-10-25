/*
* adapt-contrib-responsiveIframe
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kevin Corry <kevinc@learningpool.com>
*/
define(function(require) {

    var ComponentView = require("coreViews/componentView");
    var Adapt = require("coreJS/adapt");

    var Brightcove = ComponentView.extend({

        events: {
            'inview':'inview'
        },

        preRender: function() {
            console.log(this);
              //this.listenTo(Adapt, 'device:changed', this.resizeControl);
        },

        postRender: function() {
            var that = this;
            this.$('.brightcove-iframe').ready(function() {
                that.resizeControl(Adapt.device.screenSize);
                that.setReadyStatus();
            });
        },

        inview: function(event, visible) {
            // if (visible) {
            //     this.setCompletionStatus();
            // }
        },

        resizeControl: function(size) {
            var width = this.$('.brightcove-iframe').attr('data-width-' + size);
            var height = this.$('.brightcove-iframe').attr('data-height-' + size);
            this.$('.brightcove-iframe').width(width);
            this.$('.brightcove-iframe').height(height);
        }

    });

    Adapt.register("brightcove", Brightcove);
    return Brightcove;
});
