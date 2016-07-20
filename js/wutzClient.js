/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

var guid;
var config;
var localNetHost;
var catsLoaded;


document.addEventListener("deviceready", function(){
   
   $.getJSON( "json/config.json", function(_config) {
        config = _config;
        wutzLocatorInit();
    });
    var kuki = window.localStorage;
   guid = kuki.getItem("guid");
   
   catsLoaded = kuki.getItem("currCatKey")!== null?kuki.getItem("currCatKey"):new Array();
   
   if(guid === null || guid === undefined || guid === ""){
        console.log("name : "+device.name);
        console.log("platform : "+device.platform);
        console.log("uuid : "+device.uuid);
        console.log("phonegap : "+device.phonegap);
        //3D0AD03B-8B46-431A-BEF5-FF01B96BA990
        guid = device.uuid;
        if(guid === null || guid === undefined || guid === ""){
            guid = generateUUID();
            console.log("Setted GUID from local function");
        }
        else{
            console.log("Setted guid from Device");
        }
        kuki.setItem("guid",guid);
   }
   else{
       console.log("Read GUID from Cookie");
   }
   app.receivedEvent('deviceready');
   setUpDefaultEvents();
}, false);


function setUpDefaultEvents(){
    
    $("#filter-bars").keypress(function(e) {
        if(e.which == 13) {
            look4Bar();
        }
    });

    $("#token-input").keypress(function(e) {
        if(e.which == 13) {
            connect2Catalog();
        }
    });
}

//function onDeviceReady() {
   // console.log("Ejecutando Device Ready");
  
   
//}

function openLoading(){
     $.mobile.loading( "show", {
            text: "Loading",
            textVisible: true,
            theme: "b",
            textonly: false,
            html: ""
      });
}

function closeLoading(){
    $.mobile.loading( "hide" );
}

function look4Bar(){
    
    var barId = $("#filter-bars").val();
    openLoading();
        $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    url: config.adminHost+"/delegate/wutzDelegMan.php",
                    data: "fnc=getBar&"
                          +"barId="+barId,
                    success: function (result) {
                        closeLoading();
                        $("#findBar ul").html("");
                        if(result.length > 0){
                           for(var i=0;i<result.length;i++){
                                var newli = $("<li data-mini=\"true\"><a id=\""+result[i].id+"\"  href=\"#barDetails\" data-transition=\"pop\">-</a></li>");
                                $("a", newli).css("color","green");
                                $("a", newli).html(result[i].id+" : Opciones");
                                //newli.attr("id",result[i].id);
                                $("a", newli).click(function(){
                                    loadBarDetails(this.id);
                                });
                                $("#findBar ul").append(newli);
                             
                            }
                            $("#findBar ul").listview("refresh");
                           // $("#findBar ul").show();
                        }
                    },
                    error: function (xhr, txtStat, errThrown) {
                            closeLoading();
                            console.log(xhr.status+':::'+txtStat+':::'+errThrown);
                            $("#findBar").trigger('create');
                    }
    });
}

/**
function pingLocalServer(barId){
    $.ajax({
		type: 'POST',
		dataType: 'json',
		url: localNetHost+"/Wutz/ping.php",
		data: "",
		success: function (result) {
                    $("#barFoundBox").css("color","green");
                    $("#barFoundBox").html(barId+" : GO");
                    $("#findBar ul").show();
                    $("#barFoundBox").click(function(){
                        $.mobile.changePage("#artists");
                        loadArtistList();
                    });
		},
		error: function (xhr, txtStat, errThrown) {
                    $("#barFoundBox").css("color","red");
                    $("#barFoundBox").html(barId+" : Not Available");
                    $("#barFoundBox").click(function(){
                        $("#dialogBox h2").html("No Disponible");
                        $("#dialogBox .dialogMsg").html("El catalogo para el bar "+barId+" no está disponible por ahora. O no estás dentro del area del bar");
                        $("#dialogBox a").attr("href","#findBar");
                        $("#dialogBox a").html("Volver");
                        $.mobile.changePage("#popup");
                    });
                    $("#findBar ul").show();
		}
    });
}
**/

function loadBarDetails(barId){
    //barDetails
    openLoading();
    $.ajax({
		type: 'GET',
		dataType: 'json',
		url: config.adminHost+"/delegate/wutzDelegMan.php",
		data: "fnc=getBarDetails"
                    +"&barId="+barId,
		success: function (result) {
                        closeLoading();
                        loadBarDetailsReturn(result);
		},
		error: function (xhr, txtStat, errThrown) {
                        closeLoading();
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
                        $("#findBar").trigger('create');
		}
      });
    
}

var catInfo = null;
function loadBarDetailsReturn(barDet){
    
    catInfo = barDet;
    var settedBarToken = checkCatalogConnectToken();
    //var mwidth = $("body").css("width").replace("px","");
    //var mwidth = window.screen.availWidth;
    var mwidth = $("body").width();
    
   // console.log(mwidth);
   // console.log(window.devicePixelRatio);
    //var mheight = $("#barMapImg").css("height").replace("px","");
     
   // var mwidth = 260;
    var mheight = 100;
    var barMapUrl = "https://maps.googleapis.com/maps/api/staticmap?center="+barDet.lat+","+barDet.lon+"&markers="+barDet.lat+","+barDet.lon+"&zoom=16&size="+mwidth+"x"+mheight+"&key="+conf_locs.key;
    console.log(barMapUrl);
    $("#barMapImg").empty();
    $("#barMapImg").append("<img src=\""+barMapUrl+"\" />");
    //$("#barMapImg").html("<img src=\""+barMapUrl+"\" />");
    //catInfo.connected = false;
    $.mobile.changePage("#barDetails");
    
    $("#conect2Bar #bar2Connect").html(catInfo.id);
    
    $("#barDetails h1").html(catInfo.id + " Options");
    $("#barDetails h2").html(catInfo.id + " Details:");
    var detHtml = "";
    detHtml += "Bar:"+catInfo.nombreBar+"<br/>";
    detHtml += "Cto:"+catInfo.desc+"<br/>";
    detHtml += "Temas al mismo tiempo:"+catInfo.songsAllowed+"<br/>";
    detHtml += "Tel:"+catInfo.telefono+"<br/>";
    detHtml += "Email:"+catInfo.email+"";
               
    $("#barDetails .bar_details").html(detHtml);
    //$("#barDetails a").attr("catalog_id",catInfo.idcatalog);
    
   // connectA
    
     $("#barDetails .viewCatA").click(function(){
      //      $.mobile.changePage("#barDetails");
            loadArtistList();
      });
      
      if(settedBarToken !== ""){
          $("#barDetails .connectA").hide("fast");
      }
      else{
          $("#barDetails .connectA").show("fast");
      }
      
      //#conect2Bar
}

function loadArtistList()
{      
    var catId = catInfo.idcatalog;
    openLoading();
     $.ajax({
		type: 'GET',
		dataType: 'json',
		url: config.adminHost+"/delegate/wutzDelegMan.php",
		data: "fnc=getArtistList"
                    +"&catId="+catId,
		success: function (result) {
			loadArtistListReturn(result);
		},
		error: function (xhr, txtStat, errThrown) {
                    closeLoading();
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
}

function loadArtistListReturn(result)
{
   $("#artistList").html("");
   
    var html = "";
    
     $.each(result,function(i, value)
     {
         $("#artistList").append("<li data-mini=\"true\"><a id=\""+value.idartist+"\"  href=\"#\" data-transition=\"pop\">"+value.name+"</a></li>");
     });
     
   // $("#artistList").append(html); 
    
    $("#artistList a").click(function(){
        var artId = $(this).attr("id");
        var artName = $(this).html();
        loadAlbumPerArtist(artId, artName);
    });
    
    $("#artistList").listview("refresh");
    $("#artistList li").textSlider();
    closeLoading();
}


var songBreadc;
function loadAlbumPerArtist(artistId, artName)
{
    var catId = catInfo.idcatalog;
    $("#albums h1#albumTitle").html(artName);
    $("#albums h1#albumTitle").css("text-overflow","none");
    $("#albums h1#albumTitle").textSlider();
    songBreadc = artName;
    openLoading();
         $.ajax({
		type: 'GET',
		dataType: 'json',
		url: config.adminHost+"/delegate/wutzDelegMan.php",
		data: "fnc=getAlbumPerArtist"
                     +"&artId="+artistId
                     +"&catId="+catId,
		success: function (result) {
			loadAlbumPerArtistReturn(artistId, result);
		},
		error: function (xhr, txtStat, errThrown) {
                    closeLoading();
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
}

function loadAlbumPerArtistReturn(artistId, result)
{
    $.mobile.changePage("#albums");
    $("#albumList").html("");
   
    var html = "";
    
     $.each(result,function(i, value)
     {
         $("#albumList").append("<li data-mini=\"true\"><a id=\""+value.idalbum+"\"  href=\"#\">"+value.name+"</a></li>");
     });

    $("#albumList a").click(function(){
        songBreadc += "|"+$(this).html();
        loadSongsPerAlbum($(this).attr("id")); 
    });
    $("#albumList").listview("refresh");
    $("#albumList li").textSlider();
    closeLoading();
}


function loadSongsPerAlbum(albumId)
{
    $("#songs h1").html(songBreadc);
    var catId = catInfo.idcatalog;
    openLoading();
             $.ajax({
		type: 'GET',
		dataType: 'json',
		url: config.adminHost+"/delegate/wutzDelegMan.php",
		data: "fnc=getSongsPerAlbum"
                     +"&albId="+albumId
                     +"&catId="+catId,
		success: function (result) {
                    	loadSongsPerAlbumReturn(albumId, result);
		},
		error: function (xhr, txtStat, errThrown) {
                    closeLoading();
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
}

function loadSongsPerAlbumReturn(albumId, result){
    $.mobile.changePage("#songs");
    $("#songList").html("");
      
     $.each(result,function(i, value)
     {
         $("#songList").append("<li data-mini=\"true\"><a id=\""+value.songid+"\" >"+value.name+"</a></li>");
         
     });
    
    $("#songList a").click(function(){
            addSongToQueue($(this).attr("id"));
    });
    
    $("#songList").listview("refresh");
    $("#songList li").textSlider();
    closeLoading();
}

function addSongToQueue(songId)
{
    var catId = catInfo.idcatalog;
    var token = checkCatalogConnectToken();
    if(token !==""){
        var params = {};
        params.token = token;
        params.catId = catInfo.idcatalog;
        params.songId = songId;
        params.guid = guid;
        params = JSON.stringify(params);
        
       // console.log(params);
        openLoading();
            $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        url: config.adminHost+"/delegate/wutzDelegMan.php?fnc=addSongToQueue",
                        data: params,
                        success: function (result) {
                            closeLoading();
                            var msgOps = {OK:true,
                                          dialogTitle:"OK",
                                          dialogMsg:"Tamos, La canción se agregó a la cola",
                                          backLink:"#songs"
                                         };
                            
                                if(result.added === "OK"){
                                  openGenericDialogMsg(msgOps);
                                }
                                else{
                                  var errMsg = result.msg;
                                  msgOps.OK = false;
                                  msgOps.dialogTitle = "NO OK";
                                  if(errMsg === "added_max_songs")
                                      msgOps.dialogMsg = "Cumpliste el límite, espera a que toque un tema tuyo y podrás agregar más";
                                  else if(errMsg === "repeated")
                                      msgOps.dialogMsg ="El tema ya está agregado a la cola"
                                  else if(errMsg === "exptoken"){
                                      msgOps.dialogMsg = "El token ha expirado, ingrese el nuevo token para poner más temas";
                                      msgOps.backLink = "#conect2Bar";
                                  }
                                  else
                                       msgOps.dialogMsg = "Falló, intenta de nuevo";
                                }
                                openGenericDialogMsg(msgOps);
                             //   $("#dialogBox a").attr("href","#songs");
                             //   $("#dialogBox a").html("Back to Songs");
                        },
                        error: function (xhr, txtStat, errThrown) {
                            closeLoading();
                                console.log(xhr.status+':::'+txtStat+':::'+errThrown);
                        }
              });
      }
      else{
          var msgOps = {OK:false,
                        dialogTitle:"NO OK",
                        dialogMsg:"Necesitas ingresar llave del bar para agregar temas",
                        backLink:"#conect2Bar",
                        backText:"Ingresar LLave"};
                            
            openGenericDialogMsg(msgOps);
      }
    
}

function checkCatalogConnectToken(){
    
    if(catsLoaded[catInfo.idcatalog]!==undefined){
       var token = catsLoaded[catInfo.idcatalog];
       return token;
    }
    else{
        return "";
    }
    
 
}

function openGenericDialogMsg(opt){

    var options = opt!==undefined?opt:{};
   // console.log(options);
    var allOK = options.OK!==undefined?options.OK:false;
    var dialogTitle = options.dialogTitle!==undefined?options.dialogTitle:"ok";
    var dialogMsg = options.dialogMsg!==undefined?options.dialogMsg:"Operacion realizada con exito";
    var backLink = options.backLink!==undefined?options.backLink:"#findBar";
    var backText = options.backText!==undefined?options.backText:"Volver";    
    var back2Previous = options.back2Previous!==undefined?options.back2Previous:false;
            
    if(back2Previous){
        $("#dialogBox a").attr("data-direction","reverse");
    }
    else{
        $("#dialogBox a").attr("data-direction","false");
    }
    
    if(allOK){ 
         $("#dialogBox h2").html(dialogTitle);
         $("#dialogBox .dialogMsg").html(dialogMsg);
    }
    else{
         $("#dialogBox h2").html(dialogTitle);
         $("#dialogBox .dialogMsg").html(dialogMsg);
    }
    $("#dialogBox a").attr("href",backLink);
    $("#dialogBox a").html(backText);
    
    $.mobile.changePage("#popup");
}

function connect2Catalog(){
    
    var goBackPage = $("#songs #songList li").length>0?"#songs":"#artists";
    var params = {};
    params.token = $("#token-input").val();
    var token = params.token;
    params.catId = catInfo.idcatalog;
    
    params = JSON.stringify(params);
   // console.log(params);
    openLoading();
    $.ajax({
		type: 'POST',
		dataType: 'json',
		url: config.adminHost+"/delegate/wutzDelegMan.php?fnc=checkToken",
		data: params,
		success: function (result) {
                    closeLoading();
			if(result.tokenOK){
                            catsLoaded[catInfo.idcatalog] = token;
                            window.localStorage.setItem("currCatKey",catsLoaded);
                            loadArtistList();
                            $.mobile.changePage(goBackPage);
                        }
                        else{
                            openGenericDialogMsg({OK:false,
                                                  dialogTitle:"No Conectado",
                                                  dialogMsg:"No se ha podido conectar, revise el token e intente de nuevo",
                                                  backLink:"#conect2Bar"
                                                 });
                        }
		},
		error: function (xhr, txtStat, errThrown) {
                    closeLoading();
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
}