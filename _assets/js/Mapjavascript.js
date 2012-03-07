;(function ($) {
    var markerList = new Array();

    function clearMarkerIcons() {
        for (var i = 0; i < markerList.length; i++) {
            markerList[i].setIcon('../_assets/img/normalIcon.png');
        }
    }

    function setActiveIcon(id) {
        for (var i = 0; i < markerList.length; i++) {
            if (markerList[i].id != id) {
                continue;
            }
            markerList[i].setIcon('../_assets/img/selectedIcon.png');
        }
    }
    
    // == DEFAULTS =================================== //
    var map, FTresponse;
    var $mapCanvas;
    var $sidebar = $('#sidebar');
    var $typecontrols = $('.field-settype');
    var info_window;
    var query = "";
    var Marker_TableID = '2441665';
    //var global_suppressInfoWindows = true;
    var sidebarEnabled = true;

    // == DEBUG =================================== //
    var DEBUG = true;

    // == STYLING =================================== //
      var alexMapStyle = [
    {
      featureType: "landscape.natural",
      stylers: [
        { saturation: -100 },
        { gamma: 1 },
        { lightness: 72 }
      ]
    },{
      featureType: "road.local",
      stylers: [
        { hue: "#ffdd00" },
        { saturation: -40 },
        { lightness: 37 }
      ]
    },{
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        { hue: "#ffdd00" },
        { gamma: 0.44 },
        { saturation: -43 },
        { lightness: 22 }
      ]
    },{
      featureType: "road.arterial",
      elementType: "labels",
      stylers: [
        { hue: "#ffdd00" },
        { gamma: 1.31 },
        { saturation: -54 },
        { lightness: 17 }
      ]
    },{
      featureType: "road.highway",
      stylers: [
        { hue: "#ffdd00" },
        { lightness: -22 },
        { saturation: -41 }
      ]
    },{
      featureType: "road.highway",
      elementType: "labels",
      stylers: [
        { hue: "#ffdd00" },
        { gamma: 1.16 },
        { saturation: -15 },
        { lightness: 6 }
      ]
    },{
      featureType: "landscape.man_made",
      stylers: [
        { saturation: -100 },
        { gamma: 1 },
        { lightness: 72 }
      ]
    },{
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        { hue: "#ffdd00" },
        { lightness: 15 },
        { saturation: -13 }
      ]
    },{
      featureType: "transit",
      elementType: "labels",
      stylers: [
        { hue: "#ff4d00" }
      ]
    },{
      featureType: "water",
      elementType: "geometry",
      stylers: [
        { gamma: 0.7 },
        { hue: "#002bff" },
        { lightness: 20 },
        { saturation: -60 }
      ]
    },{
      featureType: "water",
      elementType: "labels",
      stylers: [
        { hue: "#0077ff" },
        { lightness: -17 },
        { saturation: -15 }
      ]
    },{
      featureType: "administrative",
      elementType: "labels",
      stylers: [
        { saturation: 38 },
        { hue: "#ffdd00" },
        { lightness: 6 }
      ]
    }
    ];

    // == MAP SETTINGS =================================== //
    var latlng = new google.maps.LatLng(31.241572, 35.982376);
    var defaults = {
        center: latlng,
        zoom: 12,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: false,
        panControl: false,
        styles: alexMapStyle,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // == DEFAULT QUERY =================================== //
    var sidebar_queryText = encodeURIComponent("SELECT 'Title', 'Name', 'Lat', 'Description', 'Type', 'Image' FROM " + Marker_TableID);
    var sidebar_query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + sidebar_queryText);

    var type_queryText = encodeURIComponent("SELECT 'Type' FROM " + Marker_TableID);
    var type_query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + type_queryText);

    // == FUNCTIONS =================================== //
    function getData(response) {
        var FTresponse = response;
        $sidebar.trigger('loadLayer', [response]);
        $mapCanvas.height($sidebar.height());
    }

    function typeControlsData(response) {
        $typecontrols.trigger('loadLayer', [response]);
    }

    // == MAP INIT =================================== //
    $mapCanvas = $('#map_canvas');
    $typecontrols.bind('loadLayer', function (e, response) {
        var $this = $(this),
            _res = response;
        _tbl = _res.getDataTable(), _row_count = _tbl.getNumberOfRows();
        var type;

        if (DEBUG) {
            console.log(typeof (_tbl));
            console.log(_tbl);
        }

        if ($this.find('input').length === 0) {
            for (var i = 0; i < _row_count; i++) {
                type = _tbl.getValue(i, 0);
                if ($this.find('input.' + type).length === 0) $this.append('<input type="checkbox" value="' + type + '" name="type" class="checkbox ' + type + ' active" id="type-' + type + '" checked="checked" /> \
          <label for="type-' + type + '" class="active">Places to ' + type + '</label>');
            }
        }
    });

    $('input.checkbox').live('change', function (e) {
        var $this = $(this),
            type = $this.val();

        if (!$this.attr('checked')) {
            $this.next().removeClass('active');
            $sidebar.find('.' + type).parent().parent().addClass('hide');
            $mapCanvas.gmap('findMarker', 'type', type, false, function (marker, found) {
                if (found) {
                    marker.setVisible(false);
                } else {
                    //marker.setVisible(false);
                }
            });
        } else {
            $this.next().addClass('active');
            $sidebar.find('.' + type).parent().parent().removeClass('hide');

            $mapCanvas.gmap('findMarker', 'type', type, false, function (marker, found) {
                if (found) {
                    marker.setVisible(true);
                } else {
                    //marker.setVisible(false);
                }
            });
        }
    });

    $sidebar.bind('loadLayer', function (e, response) {
        var $this = $(this);
        var _res = response;
        var _tbl = _res.getDataTable();
        var _row_count = _tbl.getNumberOfRows();
        var _col_count = _tbl.getNumberOfColumns();
        var _col_label = _tbl.getColumnLabel(0);
        var id, name, pt, desc, image, type;
        var htmlSidebarContent = [];

        htmlSidebarContent[0] = "<ul>";

        for (var i = 0; i < _row_count; i++) {
            id = i;
            title = _tbl.getValue(i, 0);
            name = _tbl.getValue(i, 1);
            pt = _tbl.getValue(i, 2), lat = pt.split(',')[0], lng = pt.split(',')[1];
            var latLng = new google.maps.LatLng(lat, lng);
            desc = _tbl.getValue(i, 3)
            type = _tbl.getValue(i, 4);
            image = _tbl.getValue(i, 5);
            var sidebarContent = "";

            var sidebarContent = "<li><h2><a data-markerid='" + id + "' class='" + type + "' rel='" + pt + "' href='#markerid-" + id + "'>" + title + "</a><hr></h2><div class='name'>By: " + name + "</div><div class='type'>Category: " + type + "</div><div class='desc'>Description: " + desc + "</div><div class='latlng'>" + pt + "</div></li>";
            htmlSidebarContent[(i + 1)] = sidebarContent;
            var htmlInfoWindowContent = "<h2 class='tooltip-header'>" + name + "</h2><p class='tooltip-desc'>" + desc + "</p><div class='image'><img src'" + image + "'></div>";

            if (sidebarEnabled) {
                var icon = '../_assets/img/normalIcon.png';

                $mapCanvas.gmap('addMarker', {
                    'type': type,
                    'position': pt,
                    'bounds': true,
                    'id': id,
                    'content': htmlInfoWindowContent,
                    icon: icon
                }, function (map, marker) {
                    markerList.push(marker);
                    $(marker).click(function () {
                        clearMarkerIcons();
                        marker.setIcon('../_assets/img/selectedIcon.png');

                        var $a = $('a[data-markerid="' + this.id + '"]');
                        $a.trigger('click.filterSidebar');
                    });
                });
            } else {
                $mapCanvas.gmap('addMarker', {
                    'position': pt,
                    'bounds': true
                }).click(function (e) {
                    $mapCanvas.gmap('openInfoWindow', {
                        'content': htmlInfoWindowContent
                    }, this);
                });
            }

            htmlSidebarContent[(htmlSidebarContent.length + 1)] = "</ul>";
            $sidebar.find('.inner').html(htmlSidebarContent.join(""));
        }

        //Filter Sidebar Function
        $this.find('#sidebar .mod-type-selector .inner a').live('click.filterSidebar', function (e) {
            e.preventDefault();

            var $this = $(this),
                $container = $this.closest('ul');

            $container.data('active-marker', $this.data('markerid'));
            $li = $container.find('a[data-markerid="' + $container.data('active-marker') + '"]').closest('li')
            setActiveIcon($this.data('markerid'));
            $container.find('li').addClass('hide');
            $container.find('a[data-markerid="' + $container.data('active-marker') + '"]').closest('li').addClass('active').removeClass('hide');
            $container.find('a[data-markerid="' + $container.data('active-marker') + '"]').closest('li').find('.desc').css('max-height', 'none');

            //Reset Function
            $sidebar.find('.reset').bind('click', function () {
                $container.find('.desc').css('max-height', '51px');

                $('input:checkbox:checked').each(function (i) {
                    clearMarkerIcons();
                    var $this = $(this),
                        type = $this.val();
                    $this.next().addClass('active');
                    $sidebar.find('.' + type).parent().parent().removeClass('hide');
                });
            }); //end Reset Function   
        }); //end Filter Sidebar Function
    }); //end Sidebar

    // == INITIALIZE =================================== //
    $mapCanvas.gmap(defaults).bind('init', function (e, map) {

        sidebar_query.send(getData);
        type_query.send(typeControlsData);
    });

})(jQuery);