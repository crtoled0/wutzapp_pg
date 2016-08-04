/**
$(document).ready
(function()
     {
        wutzLocatorInit();
     }
);
**/

//var config;
var conf_locs = [];
function wutzLocatorInit(){
    
   // $.getJSON( "json/config.json", function(_config) {
      //  config = _config;
        var gmapsUrl="";
        if( /Android/i.test(navigator.userAgent) ) {
           gmapsUrl = "https://maps.google.com/maps/api/js?v=3.exp&libraries=geometry,places&ext=.js&key="+config.androidGAPIKey;
           conf_locs.key = config.androidGAPIKey;
        }
        else if(/webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)){
            gmapsUrl = "https://maps.google.com/maps/api/js?v=3.exp&libraries=geometry,places&ext=.js&key="+config.iosGAPIKey;
            conf_locs.key = config.iosGAPIKey;
        }
        else{
           gmapsUrl = "https://maps.google.com/maps/api/js?v=3.exp&libraries=geometry,places&ext=.js&key="+config.browserGAPIKey; 
           conf_locs.key = config.browserGAPIKey;
        }
  //      gmapsUrl = "http://maps.google.com/maps/api/js?v=3.exp&sensor=false&key="+config.browserGAPIKey;  // TEMP TO FORCE LOAD BROWSER ONE
      $("#geoLocLib").remove(); 
      $("#markWLab").remove(); 
      var geoLocObj =  "<script id=\"geoLocLib\" type=\"text/javascript\" src=\""+gmapsUrl+"\"></script>";
      //  $("#geoLocLib").attr("src",gmapsUrl);
      $("body").append(geoLocObj);
      var labelmarker = "<script id=\"markWLab\" src=\"https://cdn.rawgit.com/googlemaps/v3-utility-library/master/markerwithlabel/src/markerwithlabel.js\"></script>";
        
        var waiting4GM = window.setInterval(function(){
            
            if(google){
                $("body").append(labelmarker);
                window.clearInterval(waiting4GM);
            }
        },100);
        
        
        
        $('#mapholder').height($(window).height() - (100 + $('[data-role=header]').height() - $('[data-role=footer]').height()));
  //  });
}


function getLocationsMap() {
    
 //   $("div:jqmData(role='page'):last").bind('pageinit', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError, {enableHighAccuracy:true, timeout: 6000});
            $.mobile.changePage("#locationMapPage");
           // $('#yay').fadeIn('slow');
        } else {
            $("#dialogBox h2").html("No Disponible");
            $("#dialogBox .dialogMsg").html("Este navegador no tiene activado GPS ");
            $("#dialogBox a").attr("href","#findBar");
            $("#dialogBox a").html("Volver");
            $.mobile.changePage("#popup");
        }
   // });
}

function showPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
   // $('#val').html("<b>Latitude:</b> " + lat + "<br><b>Longitude:</b> " + lon);
        var latlon = new google.maps.LatLng(lat, lon);
    var mapholder = document.getElementById('mapholder');
    var mapHeig = $("#locationMapPage").css("height");
    mapHeig = mapHeig.replace("px","");
    mapHeig = parseInt(mapHeig);
    mapHeig -= 200;
    mapHeig += "px";
    //$("#mapholder").css("width","100%");
   // $("#mapholder").css("height",mapHeig);
  
    var myOptions = {
        zoom: 17,
        center: latlon,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };    
    
    var map = new google.maps.Map(document.getElementById("mapholder"), myOptions);
   /**
    var marker = new google.maps.Marker({
        position: latlon,
        map: map,
        title: "You are here!",
        label: "You"
    });
    **/
    
    $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: config.adminHost+"/getNearByBars/"+lat+"/"+lon,
                    data: "",
                    success: function (result) {
                        drawBarMarkers(result, map);
                    },
                    error: function (xhr, txtStat, errThrown) {
                            alert(xhr.status+':::'+txtStat+':::'+errThrown);
                    }
    });
    
   // marker.addListener('click', function(){console.log("Clicked Marker")});
}

function drawBarMarkers(barArr, map){
    
    var imageIcon = "./images/mark.png";
    var markerBars = new Array();
   
    for(var i=0;i<barArr.length;i++){
        
        /**
        markerBars[i]= new google.maps.Marker({
                                    position: new google.maps.LatLng(barArr[i].lat, barArr[i].lon),
                                    map: map,
                                    title: barArr[i].id,
                                    icon: imageIcon
                                });
          **/                      
                               
     markerBars[i]= new MarkerWithLabel({
                                    position: new google.maps.LatLng(barArr[i].lat, barArr[i].lon),
                                    map: map,
                                    title: barArr[i].id,
                                    labelContent: barArr[i].id,
                                    labelAnchor: new google.maps.Point(15, 65),
                                    labelClass: "labels", // the CSS class for the label
                                    labelInBackground: false,
                                    icon: imageIcon
                                  });
       
        
        markerBars[i].addListener('click', function(){
            loadBarDetails(this.title);
            console.log("Clicked Marker "+this.title);
        }); 
        
    }
}


function showError(error) {
    var message = "";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            message = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            message = "An unknown error occurred."
            break;
            
        $("#dialogBox h2").html("Error");
        $("#dialogBox .dialogMsg").html(message);
        $("#dialogBox a").attr("href","#findBar");
        $("#dialogBox a").html("Volver");
        $.mobile.changePage("#popup");
    }
}