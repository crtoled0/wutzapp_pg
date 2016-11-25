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
   
   catsLoaded = kuki.getItem("currCatKey")!== null?JSON.parse(kuki.getItem("currCatKey")):{};
   
   if(guid === null || guid === undefined || guid === ""){
        console.log("name : "+device.name);
        console.log("platform : "+device.platform);
        console.log("uuid : "+device.uuid);
        console.log("phonegap : "+device.phonegap);
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
   $.mobile.changePage("#findBar");
}, false);


function setUpDefaultEvents(){
    
    $("#filter-bars").keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            look4Bar();
        }
    });

    $("#token-input").keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            connect2Catalog();
        }
    });
}

//function onDeviceReady() {
   // console.log("Ejecutando Device Ready");
  
   
//}

function openLoading(){
     $.mobile.loading( "show", {
            text: WutzTranslator.trans("loading"),
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
    $("#songList").html(""); // If you are looking for a new bar then the song list gets refreshed
    openLoading();
        $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: config.adminHost+"/searchBar/"+barId,
                    data: "",
                    success: function (result) {
                        closeLoading();
                        $("#findBar ul").html("");
                        if(result.length > 0){
                           for(var i=0;i<result.length;i++){
                                var newli = $("<li data-mini=\"true\"><a id=\""+result[i].id+"\"  href=\"#barDetails\" data-transition=\"pop\">-</a></li>");
                                $("a", newli).css("color","green");
                                $("a", newli).html(result[i].id+" : "+WutzTranslator.trans("options"));
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

function loadBarDetails(barId){
    //barDetails
    openLoading();
    $.ajax({
		type: 'GET',
		dataType: 'json',
		url: config.adminHost+"/getBar/"+barId,
		data: "",
		success: function (result) {
                        closeLoading();
                        wtzCache.setBarIdInSession(barId);
                        //window.sessionStorage.setItem("currLoadedBar",barId);
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
    var barId = wtzCache.getBarIdInSession();
    wtzCache.loadBarCachedInfo(barId, catInfo.idcatalog, catInfo.catVersion);
    //wtzCache.loadBarCachedInfo(barId, catInfo.idcatalog, 0);
    
    var settedBarToken = checkCatalogConnectToken();
    var mwidth = $("body").width();
    
     
   // var mwidth = 260;
    var mheight = 100;
    var barMapUrl = "https://maps.googleapis.com/maps/api/staticmap?center="+barDet.lat+","+barDet.lon+"&markers="+barDet.lat+","+barDet.lon+"&zoom=16&size="+mwidth+"x"+mheight+"&key="+conf_locs.key;
    console.log(barMapUrl);
    $("#barMapImg").empty();
    $("#barMapImg").append("<img src=\""+barMapUrl+"\" />");
    $.mobile.changePage("#barDetails");
    
    $("#conect2Bar #bar2Connect").html(catInfo.id);
    
    $("#barDetails h1").html(catInfo.id + " "+WutzTranslator.trans("options")+"");
    $("#barDetails h2").html(catInfo.id + " "+WutzTranslator.trans("details")+":");
    var detHtml = "";
    detHtml += "Bar:"+catInfo.nombreBar+"<br/>";
    detHtml += "Cto:"+catInfo.desc+"<br/>";
    detHtml += ""+WutzTranslator.trans("songs_same_time")+" :"+catInfo.songsAllowed+"<br/>";
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

function loadArtistList(){
    var catId = catInfo.idcatalog;
    openLoading();
    var artsList = wtzCache.getArtists();
    if(artsList === null || artsList === undefined){
            $.ajax({
                       type: 'GET',
                       dataType: 'json',
                       url: config.adminHost+"/getArtistList/"+catId,
                       data: "",
                       success: function (result) {
                               loadArtistListReturn(result);
                       },
                       error: function (xhr, txtStat, errThrown) {
                           closeLoading();
                               console.log(xhr.status+':::'+txtStat+':::'+errThrown);
                       }
             });
     }
     else
         loadArtistListReturn(artsList);
}

function loadArtistListReturn(result){
   wtzCache.addArtists(result);
   $("#artistList").html("");
   
    var html = "";
    
     $.each(result,function(i, value){
         var iconUrl = value.lfm_img_url?value.lfm_img_url:"./img/logo64x64.png";
         $("#artistList").append("<li data-mini=\"true\"><img style=\"z-index:1\" src=\""+iconUrl+"\"/><a id=\""+value.idartist+"\"  href=\"#\" data-transition=\"pop\">"+value.name+"</a></li>");
     });
     
   // $("#artistList").append(html); 
    
    $("#artistList a").click(function(){
        var artId = $(this).attr("id");
        var artName = $(this).html();
        loadAlbumPerArtist(artId, artName);
    });
    try{
        $("#artistList").listview("refresh");
    }
    catch(ex){
        console.log("New List");
    }
    finally{
        $("#artistList li").textSlider();
        closeLoading();
    }
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
    var albumList = wtzCache.getAlbums(artistId);
    if(albumList === null || albumList===undefined){
         $.ajax({
		type: 'GET',
		dataType: 'json',
		url: config.adminHost+"/getAlbumPerArtist/"+catId+"/"+artistId,
		data: "",
		success: function (result) {
			loadAlbumPerArtistReturn(artistId, result);
		},
		error: function (xhr, txtStat, errThrown) {
                    closeLoading();
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
    }
    else{
        loadAlbumPerArtistReturn(artistId, albumList);
    }
}

function loadAlbumPerArtistReturn(artistId, result)
{
    wtzCache.addAlbums(artistId, result);
    $.mobile.changePage("#albums");
    $("#albumList").html("");
   
    var html = "";
    
     $.each(result,function(i, value){
         var iconUrl = value.lfm_img_url?value.lfm_img_url:"./img/logo64x64.png";
         $("#albumList").append("<li data-mini=\"true\"><img style=\"z-index:1\" src=\""+iconUrl+"\"/><a id=\""+value.idalbum+"\"  href=\"#\">"+value.name+"</a></li>");
     });

    $("#albumList a").click(function(){
        songBreadc += ">"+$(this).html();
        loadSongsPerAlbum($(this).attr("id")); 
    });
    $("#albumList").listview("refresh");
    $("#albumList li").textSlider();
    closeLoading();
}


function loadSongsPerAlbum(albumId){
    $("#songs h1").html(songBreadc);
    var catId = catInfo.idcatalog;
    openLoading();
    var songsList = wtzCache.getSongs(albumId);
    if(songsList === null || songsList===undefined){
             $.ajax({
		type: 'GET',
		dataType: 'json',
		url: config.adminHost+"/getSongsPerAlbum/"+catId+"/"+albumId,
		data: "",
		success: function (result) {
                    	loadSongsPerAlbumReturn(albumId, result);
		},
		error: function (xhr, txtStat, errThrown) {
                    closeLoading();
			console.log(xhr.status+':::'+txtStat+':::'+errThrown);
		}
      });
    }
    else
        loadSongsPerAlbumReturn(albumId, songsList);
}

function loadSongsPerAlbumReturn(albumId, result){
    wtzCache.addSongs(albumId, result);
    $.mobile.changePage("#songs");
    $("#songList").html("");
      
     $.each(result,function(i, value)
     {
         var songIcon = "";
         if(value.media_type === "audio")
             songIcon = "<img src=\""+config.audioIcon+"\" />";
         else if(value.extension === "tube")
             songIcon = "<img src=\""+config.youtubeIcon+"\" />";
         else
             songIcon = "<img src=\""+config.videoIcon+"\" />";
             
         $("#songList").append("<li data-mini=\"true\"><a class=\"songA\" data-rel=\"dialog\" id=\""+value.songid+"\" >"+songIcon+""+value.name+"</a></li>");
         
     });
    
    $("#songList a").click(function(){
        
        var songName = $(this).html();
            addSongToQueue($(this).attr("id"), songName);
    });
    
    $("#songList").listview("refresh");
    $("#songList li").textSlider();
    closeLoading();
}

function addSongToQueue(songId, songName)
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
                        url: config.adminHost+"/addSongToQueue",
                        data: params,
                        success: function (result) {
                            closeLoading();
                            var msgOps = {OK:true,
                                          dialogTitle:"OK",
                                          dialogMsg:""+WutzTranslator.trans("added_song_msg",{"SONGNAME":songName})+"",
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
                                      msgOps.dialogMsg = WutzTranslator.trans("on_limit_msg",{"ALLOWED_SONGS":catInfo.songsAllowed});
                                  else if(errMsg === "repeated")
                                      msgOps.dialogMsg =WutzTranslator.trans("already_added",{"SONGNAME":songName});
                                  else if(errMsg === "exptoken"){
                                      msgOps.dialogMsg = WutzTranslator.trans("expired_token");
                                      msgOps.backLink = "#conect2Bar";
                                  }
                                  else
                                       msgOps.dialogMsg = WutzTranslator.trans("gen_failed_msg");
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
                        dialogMsg: WutzTranslator.trans("need_daily_key"),
                        backLink:"#conect2Bar",
                        backText: WutzTranslator.trans("type_key")};
                            
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
    var dialogMsg = options.dialogMsg!==undefined?options.dialogMsg:WutzTranslator.trans("succes_gen_msg");
    var backLink = options.backLink!==undefined?options.backLink:"#findBar";
    var backText = options.backText!==undefined?options.backText:WutzTranslator.trans("back");
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
    
    $.mobile.changePage("#popup",{"role":"dialog", "data-transition":"pop"});
}

function openGenericConfirm(opt){

    var options = opt!==undefined?opt:{};
   // console.log(options);
    var allOK = options.OK!==undefined?options.OK:false;
    var dialogTitle = options.dialogTitle!==undefined?options.dialogTitle:"ok";
    var dialogMsg = options.dialogMsg!==undefined?options.dialogMsg:WutzTranslator.trans("succes_gen_msg");
    var backLink = options.backLink!==undefined?options.backLink:"#artists";
    var backText = options.backText!==undefined?options.backText:WutzTranslator.trans("cancel");
    
    var continueLink = options.continueLink!==undefined?options.continueLink:"#findBar";
    var continueText = options.continueText!==undefined?options.continueText:WutzTranslator.trans("ok");
    //var back2Previous = options.back2Previous!==undefined?options.back2Previous:false;
    
    
            
    $("#confBox .confirmCancel").attr("data-direction","reverse");
    
    if(allOK){ 
         $("#confBox h2").html(dialogTitle);
         $("#confBox .confirmMsg").html(dialogMsg);
    }
    else{
         $("#confBox h2").html(dialogTitle);
         $("#confBox .confirmMsg").html(dialogMsg);
    }
    $("#confBox .confirmCancel").attr("href",backLink);
    $("#confBox .confirmCancel").html(backText);
    
    $("#confBox .confirmOK").attr("href",continueLink);
    $("#confBox .confirmOK").html(continueText);
    
    $.mobile.changePage("#confirmBox",{"role":"dialog", "data-transition":"pop"});
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
		url: config.adminHost+"/checkToken",
		data: params,
		success: function (result) {
                    closeLoading();
			if(result.tokenOK){
                            catsLoaded[catInfo.idcatalog] = token;
                            window.localStorage.setItem("currCatKey",JSON.stringify(catsLoaded));
                            loadArtistList();
                            $.mobile.changePage(goBackPage);
                        }
                        else{
                            openGenericDialogMsg({OK:false,
                                                  dialogTitle:WutzTranslator.trans("not_connected"),
                                                  dialogMsg:WutzTranslator.trans("no_connected_msg"),
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

function areYouSureLeaveBar(){
    var barId = wtzCache.getBarIdInSession(); //window.sessionStorage.getItem("currLoadedBar");
    var msgOps = {OK:true,
                    dialogTitle:WutzTranslator.trans("confirm"),
                    dialogMsg: WutzTranslator.trans("areSureMsg",{"BARID":barId}),
                    continueLink:"#findBar",
                    continueText:WutzTranslator.trans("continueY"),
                    backText:WutzTranslator.trans("continueN")
                 };         
 openGenericConfirm(msgOps);
}