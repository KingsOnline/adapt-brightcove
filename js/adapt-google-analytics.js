define(['core/js/adapt'], function(Adapt) {

  Adapt.on("adapt:start", function() {
    var gaIdentifier = "UA-83714529-7";
    var GaTag = document.createElement("script");
    var GaScript = "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create', '" + gaIdentifier + "', 'auto');";
    GaTag.innerHTML = GaScript;
    document.head.appendChild(GaTag);
  });

  Adapt.once("pageView:ready", function() {
    ga('set', 'page', googleAnalytics.getUrl());
    ga('send', 'pageview');
    googleAnalytics.setupPrintPage();
    googleAnalytics.setupContents();
    googleAnalytics.setupSearch();
    googleAnalytics.setupGoTop();
    googleAnalytics.setupSocial();
    googleAnalytics.setupClose();
  });

  Adapt.on("pageView:ready menuView:ready", function() {
    Adapt.log.debug('/' + location.hash);
    ga('set', 'page', '/' + location.hash);
    googleAnalytics.setupQuickNav();
  });

  var googleAnalytics = {
    findComponent: function(componentName) {
      var firstComponentModel = Adapt.components.models.filter(function(model) {
        return model.get("_component") === componentName;
      });
      return firstComponentModel;
    },

    kalturaFullscreen: function(id) {
      ga('send', 'event', 'Kaltura-fullscreen', id, Adapt.course.get('title'));
    },

    kalturaLoaded: function(id) {
      ga('send', 'event', 'Kaltura-loaded', id, Adapt.course.get('title'));
    },

    kalturaFirstPlay: function(id) {
      ga('send', 'event', 'Kaltura-firstPlay', id, Adapt.course.get('title'));
    },

    kalturaComplete: function(percentage, id) {
      ga('send', 'event', 'Kaltura-' + percentage + '%', id, Adapt.course.get('title'));
    },

    kalturaReplay: function(id) {
      ga('send', 'event', 'Kaltura-replay', id, Adapt.course.get('title'));
    },

    kalturaChangePlaybackRate: function(rate, id) {
      ga('send', 'event', 'Kaltura-rate-change-' + rate, id, Adapt.course.get('title'));
    },

    kalturaInlineTranscript: function(id) {
      ga('send', 'event', 'Kaltura-transcript-opened', id, Adapt.course.get('title'));
    },

    kalturaExternalTranscript: function(id) {
      ga('send', 'event', 'Kaltura-transcript-downloaded', id, Adapt.course.get('title'));
    },

    setupPrintPage: function() {
      $('body').on('click', '.printPage-icon', function() {
        event.preventDefault();
        Adapt.log.debug('print page fired');
        ga('send', 'event', 'printPage', 'navigation', Adapt.course.get('title'));
      });
      $('body').on('click', '.printPage-icon', function() {
        event.preventDefault();
        Adapt.log.debug('print page fired');
        ga('send', 'event', 'printPage', 'navigation', Adapt.course.get('title'));
      });
    },

    setupClose: function() {
      $('body').on('click', '.navigation-close-button', function(componentId) {
        event.preventDefault();
        Adapt.log.debug('Course closed');
        ga('send', 'event', 'course-exited', 'exit-icon-clicked', Adapt.course.get('title'));
      });
    },

    setupContents: function() {
      Adapt.on("contents:pageComplete", function() {
        ga('send', 'event', 'Contents', 'page-complete', '/' + Adapt.contentObjects._byAdaptID[Adapt.location._currentId][0].get('title'));
      });
      $('body').on('click', '.contents-article-title', function() {
        Adapt.log.debug('Article clicked');
        ga('send', 'event', 'Contents', 'article-clicked', Adapt.course.get('title'));
      });
      $('body').on('click', '.contents-landing-page-title', function() {
        Adapt.log.debug('Landing page clicked');
        ga('send', 'event', 'Contents', 'landing-page-navigation', Adapt.course.get('title'));
      });
      $('body').on('click', '.contents-page-title', function() {
        Adapt.log.debug('Landing page clicked');
        ga('send', 'event', 'Contents', 'page-navigation', Adapt.course.get('title'));
      });
      $('body').on('click', '.contents-component-title', function() {
        Adapt.log.debug('component clicked');
        ga('send', 'event', 'Contents', 'component-clicked', Adapt.course.get('title'));
      });
    },

    setupGoTop: function() {
      $('body').on('click', '.goTop-button', function() {
        event.preventDefault();
        Adapt.log.debug('Go top');
        ga('send', 'event', 'GoTop', 'icon-clicked', Adapt.course.get('title'));
      });
    },

    setupSearch: function(search) {
      $('body').on('click', '.icon-search', function() {
        event.preventDefault();
        Adapt.log.debug('Searching');
        ga('send', 'event', 'Search', 'icon-clicked', Adapt.course.get('title'));
      });
    },

    setupSocial: function() {
      $('body').on('click', '.social-open-button', function() {
        event.preventDefault();
        Adapt.log.debug('Social');
        ga('send', 'event', 'Social', 'social-opened', Adapt.course.get('title'));
      });
    },

    setupQuickNav: function() {
      $(".quicknav #previous").on("click", function() {
        event.preventDefault();
        Adapt.log.debug('Quicknav back');
        ga('send', 'event', 'Quicknav', 'previous', Adapt.course.get('title'));
      });
      $(".quicknav #next").on("click", function() {
        event.preventDefault();
        Adapt.log.debug('Quicknav next');
        ga('send', 'event', 'Quicknav', 'next', Adapt.course.get('title'));
      });
    },

    getUrl: function() {
      return location.pathname + location.hash;
    }
  };

  return googleAnalytics;
});