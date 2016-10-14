/* 
 * Copyright (c) 2016, CRTOLEDO
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */


;(function(window, document, undefined){
	"use strict";
	
	/**
	 * The actual constructor of the Global object
	 */
	var WutzCacheImpl = {
	    _version : 0.1,
	    _config : {
			'defaultLang' : 'en'
	    },
            _cacheOnMemory : {},
            _barInSession : "",
            loadBarCachedInfo : function(barId, catId , callback){
               var thisMod = this;
               thisMod._barInSession = barId;
               var barCached = thisMod._cacheOnMemory[barId];
               if(barCached === undefined){
                   barCached = JSON.parse(window.localStorage.getItem(barId));
                   if(barCached !== null && barCached !== undefined){
                       thisMod._cacheOnMemory[barId] = barCached;
                   }
                   else{
                       thisMod.createNewBar(catId);
                       barCached = thisMod._cacheOnMemory[barId];
                   }
               }
               if(barCached.catId === catId){
                   if(callback !== undefined)
                        callback(barCached);
               }
               else{
                   removeBarFromCache(barId, barCached.catId, function(){
                       thisMod._cacheOnMemory[barId] = {"catId":catId};
                       if(callback !== undefined)
                        callback({newbar:true});
                   });
               }
            },
            setBarIdInSession : function(barId){
                var thisMod = this;
                thisMod._barInSession = barId;
            },
            getBarIdInSession : function(){
                var thisMod = this;
                return thisMod._barInSession;
            },
            createNewBar : function(catId){
                var thisMod = this;
                var currBarId = thisMod._barInSession;
                var barObj = {"catId":catId};
               // barObj[currBarId] = ;
                thisMod._cacheOnMemory[currBarId] = barObj;
                window.localStorage.setItem(currBarId, JSON.stringify(barObj));
            },
            addArtists : function(artsList){
                var thisMod = this;
                var currBarId = thisMod._barInSession;
                if(thisMod._cacheOnMemory[currBarId].artists === undefined){
                    thisMod._cacheOnMemory[currBarId].artists = artsList;
                    window.localStorage.setItem(currBarId, JSON.stringify(thisMod._cacheOnMemory[currBarId]));
                }
            },
            addAlbums : function(artistId, albumList){
                var thisMod = this;
                var currBarId = thisMod._barInSession;
                var flagAdd = false;
                if(thisMod._cacheOnMemory[currBarId].albums === undefined){
                    thisMod._cacheOnMemory[currBarId].albums = {};
                    flagAdd = true;
                }
                else if(thisMod._cacheOnMemory[currBarId].albums[artistId] === undefined){
                    flagAdd = true;
                }
                if(flagAdd){
                    thisMod._cacheOnMemory[currBarId].albums[artistId] = albumList;
                    window.localStorage.setItem(currBarId, JSON.stringify(thisMod._cacheOnMemory[currBarId]));
                }
            },
            addSongs : function(albumId, songList){
               var thisMod = this;
                var currBarId = thisMod._barInSession;
                var flagAdd = false;
                if(thisMod._cacheOnMemory[currBarId].songs === undefined){
                    thisMod._cacheOnMemory[currBarId].songs = {};
                    flagAdd = true;
                }
                else if(thisMod._cacheOnMemory[currBarId].songs[albumId] === undefined){
                    flagAdd = true;
                }
                if(flagAdd){
                    thisMod._cacheOnMemory[currBarId].songs[albumId] = songList;
                    window.localStorage.setItem(currBarId, JSON.stringify(thisMod._cacheOnMemory[currBarId]));
                }
            },
            getArtists : function(){
                var thisMod = this;
                var currBarId = thisMod._barInSession;
                return thisMod._cacheOnMemory[currBarId].artists;
            },
            getAlbums : function(artistId){
                var thisMod = this;
                var currBarId = thisMod._barInSession;
                if(thisMod._cacheOnMemory[currBarId].albums)
                    return thisMod._cacheOnMemory[currBarId].albums[artistId];
                else
                    return undefined;
            },
            getSongs : function(albumId){
                var thisMod = this;
                var currBarId = thisMod._barInSession;
                if(thisMod._cacheOnMemory[currBarId].songs)
                    return thisMod._cacheOnMemory[currBarId].songs[albumId];
                else
                    return undefined;
            }
	};
	
        //Private functions 
        var removeBarFromCache = function(barId, catId, callback){
            localStorage.removeItem(barId);
            var curBarKeys = localStorage.getItem("currCatKey");
            delete curBarKeys[catId];
            localStorage.setItem("currCatKey",curBarKeys);
            //currCatKey
            delete WutzCacheImpl._cacheOnMemory[barId];
            if(callback !== undefined)
                callback();
        };
        
        
	var WutzCache = function(){};
	WutzCache.prototype = WutzCacheImpl;
	WutzCache = new WutzCache();
	window.wtzCache = WutzCache;
})(window, document);