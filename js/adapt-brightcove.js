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
          console.log($(this));

          var e = this.$('.brightcove-video-holder :first-child').attr('id');
          console.log(e);

          myPlayerID.setAttribute('data-video-id', this.model.get("_videoId"));
          myPlayerID.setAttribute('data-account', 4629028765001); // hard coded for King's College but we can make this an option if we open source this.
          myPlayerID.setAttribute('data-player', 'default');
          bc(document.getElementById("myPlayerID"));
          myPlayer = videojs("myPlayerID");
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
      // var hamburgerIcon = "<script src='https://players.brightcove.net/4629028765001/default_default/index.min.js'></script>";
      // $('body').append(hamburgerIcon);
      assignID();
    });

    function assignID() {
      console.log($(".block"));
      if ($(".brightcove-inner").length > 0) {
          // Do stuff with $(".Mandatory")
          $(".brightcove-inner").each(function() {
              console.log('h');
          });
      }
    }

    Adapt.register("brightcove", Brightcove);
    return Brightcove;

});
