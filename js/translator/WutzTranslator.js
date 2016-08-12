/* 
 * Copyright (C) 2016 CRTOLEDO.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */


;(function(window, document, undefined){
	"use strict";
	
	/**
	 * The actual constructor of the Global object
	 */
	var WutzTranslatorImpl = {
	    _version : 0.1,
	    _config : {
			'defaultLang' : 'en'
	    },
            _attributes : {},
            loadWutzTranslator : function(lang, callback){
                var lang2Load = "";
                var transMod = this;
                if(lang !== undefined){
                    lang2Load = lang;
                }
                else{
                   lang2Load = navigator.language || navigator.userLanguage;
                   lang2Load = lang2Load.substring(0,2);
                }
                $.getJSON( "js/translator/loc/"+lang2Load+".json", function(_jsonAtts) {
                     transMod._attributes = _jsonAtts;
                     //console.log(JSON.stringify(transMod._attributes));
                     transMod.transPageHtml();
                     callback();
                });
                
            },
            trans: function(attName,replaceTokens){
                var transMod = this;
                var attVal = transMod._attributes[attName];
                if(replaceTokens === undefined)
                    return attVal;
                else{
                    $.each(replaceTokens, function(key,val){
                        attVal = attVal.replace("__"+key+"__",val);
                    });
                }
                return attVal;
            },
            transPageHtml: function(){
                var transMod = this;
                $("[loc-trans]").each(function(i){
                        var htObj = $(this);
                        var htmlObj = $(this).attr("loc-trans");
                        htmlObj = htmlObj.replace(/'/ig,"\"");
                        //console.log(typeof htmlObj + " : "+htmlObj);
                        htmlObj = JSON.parse(htmlObj);
                        $.each(htmlObj, function(objAtt, attName) {
                                if(objAtt !== "html")
                                        htObj.attr(objAtt, transMod._attributes[attName]);
                                else
                                        htObj.html(transMod._attributes[attName]);
                        });
                });
            }
	};
	
	var WutzTranslator = function(){};
	WutzTranslator.prototype = WutzTranslatorImpl;
	WutzTranslator = new WutzTranslator();
	window.WutzTranslator = WutzTranslator;
})(window, document);