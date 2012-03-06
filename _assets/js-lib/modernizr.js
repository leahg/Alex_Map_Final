    Modernizr.load([
      {
        load: [
          'http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js', 
          'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js',
          '../_assets/js-lib/jquery.ui.map.full.min.js',
          //'../_assets/js-lib/modernizr.min.js',
          //'http://jquery-ui-map.googlecode.com/svn/trunk/ui/min/jquery.ui.map.full.min.js',
          //'http://www.google.com/jsapi',
          //'http://maps.google.com/maps/api/js?sensor=false',
          //'_assets/js-lib/jquery-waypoints/waypoints.min.js',
          //'_assets/js/testscript.js',
        ],
        complete: function () {
          if ( !window.jQuery ) {
            Modernizr.load('../_assets/js-lib/jquery/1.7/jquery.min.js');
          }

          if ( !window.jQuery.ui ) {
            Modernizr.load('../_assets/js-lib/jqueryui/1.8.16/jquery-ui.min.js');
          }

          $('body').data('SITE_URL', location.hostname);
        
          Modernizr.load('../_assets/js/Mapjavascript.js');

        }
      }
    ]);
