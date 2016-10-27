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
        },

        preRender: function() {
              //this.listenTo(Adapt, 'device:changed', this.resizeControl);
        },

        postRender: function() {
          myPlayerID.setAttribute('data-video-id', 5166470429001);
          myPlayerID.setAttribute('data-account', 4629028765001);
          myPlayerID.setAttribute('data-player', 'default');
          bc(document.getElementById("myPlayerID"));
          myPlayer = videojs("myPlayerID");
          myPlayer.play();
          this.setReadyStatus();
        },

        doLoadStart: function() {
          console.log("start load");
        },

        resizeControl: function(size) {
            var width = this.$('.brightcove-iframe').attr('data-width-' + size);
            var height = this.$('.brightcove-iframe').attr('data-height-' + size);
            this.$('.brightcove-iframe').width(width);
            this.$('.brightcove-iframe').height(height);
        }

    });

    Adapt.on("pageView:preRender", function() {
      var hamburgerIcon = "<script src='https://players.brightcove.net/4629028765001/default_default/index.min.js'></script>";
      $('body').append(hamburgerIcon);
    });



    Adapt.register("brightcove", Brightcove);
    return Brightcove;

});
