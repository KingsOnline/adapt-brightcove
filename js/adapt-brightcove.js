/*
* adapt-contrib-responsiveIframe
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Kevin Corry <kevinc@learningpool.com>
*/
define(function(require) {

    var ComponentView = require("coreViews/componentView");
    var Adapt = require("coreJS/adapt");
    var videoJs = require('components/adapt-brightcove/js/brightcove');

    var Brightcove = ComponentView.extend({

        events: {
            'inview':'inview'
        },

        preRender: function() {
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

            var myPlayer = videojs('example_video_1');
            // myPlayer.on('loadstart',doLoadStart);
            console.log(myPlayer);
            console.log(myPlayer.id(),"id");
            this.changeVideo(myPlayer);
        },

        doLoadStart: function() {
          console.log("start load");
        },


        changeVideo: function(myPlayer) {
          console.log(document.getElementsByClassName("video-js")[0]);
          document.getElementsByClassName("video-js")[0].setAttribute("data-video-id", "5166470429001");
          myPlayer.play();
          //myPlayer.src({"type":"video/mp4", "src":"http://solutions.brightcove.com/bcls/assets/videos/Bird_Titmouse.mp4"});
          myPlayer.play();
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
