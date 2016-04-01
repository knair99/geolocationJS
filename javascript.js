/**
 * Created by kprasad on 3/31/16.
 */

var json_data = null;
var locations = null;

function loadJSON(file, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

$(document).ready(function() {
    if (json_data === null) {
        loadJSON("data.json", function (response) {
            json_data = JSON.parse(response);
            locations = json_data.locations;
            var places = locations.location;


            L.mapbox.accessToken = 'pk.eyJ1Ijoia2FydW5ha2FyYW45OSIsImEiOiJjaWx6bDBsenAwMGhudnVtNXNnMHdwN2U0In0.2DpDui77nqeh9tiZrMeniA';
            var map = L.mapbox.map('map', 'mapbox.streets')
                .setView([places[1].latitude, places[1].longitude], 10);



            //Now plot all company locations
            var myLayer = L.mapbox.featureLayer().addTo(map);
            var geoJson = [];

            //First, plot the locations + flags
            for (var i = 0; i < places.length; i++) {
                var flag = null;
                var each_item = places[i];

                if (each_item.type === "RetailLocation") {
                    flag = "green-flag-icon.png";
                } else if (each_item.type === "Distribution Facility") {
                    flag = "red-flag-icon.png";
                } else if (each_item.type === "Call Center") {
                    flag = "yellow-flag-icon.png";
                } else if (each_item.type === "HeadQuarters") {
                    flag = "white-flag-icon.png";
                } else {
                    flag = "red-flag-icon.png";
                }

                //For flag
                geoJson.push(
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [each_item.longitude, each_item.latitude]
                        },
                        "properties": {
                            "title": each_item.type + ', ' + each_item.address,
                            "icon": {
                                "iconUrl": flag,
                                "iconSize": [50, 50], // size of the icon
                                "iconAnchor": [25, 25], // point of the icon which will correspond to marker's location
                                "popupAnchor": [0, -25], // point from which the popup should open relative to the iconAnchor
                                "className": "dot"
                            }
                        }
                    });

                // Set a custom icon on each marker based on feature properties.
                myLayer.on('layeradd', function (e) {
                    var marker = e.layer,
                        feature = marker.feature;
                    marker.setIcon(L.icon(feature.properties.icon));
                });
                // Add features to the map.
                myLayer.setGeoJSON(geoJson);
            } //end of first for loop


            //now the revenue circles
            geoJson = [];

            for (var i = 0; i < places.length; i++) {
                var flag = null;
                var radius = 1000; //for revenue circle
                var each_item = places[i];

                //make diff sized circles depending on revenue size
                if (each_item["$revenue"] < 10000) {
                    radius = 10;
                } else if (each_item["$revenue"]  < 100000) {
                    radius = 20;
                } else if (each_item["$revenue"]  < 1000000) {
                    radius = 30;
                } else if (each_item["$revenue"] < 10000000) {
                    radius = 40;
                } else {
                    radius = 50;
                }

                geoJson.push(
                    {
                        "type": "FeatureCollection",
                        "features": {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [each_item.longitude, each_item.latitude]
                            },
                            "properties": {
                                "title": each_item["$revenue"] ,
                                "radius": radius
                            }
                        }
                    });

            }//end of second for loop

            L.mapbox.featureLayer(geoJson, {
                pointToLayer: function(feature, latlon) {
                    return L.circleMarker(latlon, {radius: feature.properties.radius});
                }
            }).addTo(map);


        });
    }
});



