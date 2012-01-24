package ws.outset.utils {
	
	import flash.display.MovieClip;	
	import flash.display.Stage;
	import flash.filters.GlowFilter;
	import flash.geom.Point;
	import flash.net.LocalConnection;
	import flash.system.Capabilities;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.geom.Matrix;
	import flash.utils.getDefinitionByName;	
	import flash.filters.BitmapFilterQuality;

	public class Utils {
		
		public static function getRandomMCName():String {
			return "m" + (Math.ceil(Math.random()*1000));
		}
		public static function getFormatedTime(numOfSeconds:Number, type:String):String {
			switch(type){
				case "minutes_seconds":
					var minutes:Number = Math.floor(numOfSeconds / 60);
					var seconds:Number = Math.floor(numOfSeconds % 60);
					var secondsString:String = "";
					if (seconds < 10) {
						secondsString = "0" + seconds.toString();
					} else {
						secondsString = seconds.toString();
					}
					return minutes + "." + secondsString;
				break;
				default:
					ws.outset.utils.Debug.echo("ERROR(getFormatedTime) type=" + type);
					return "";
				break;
			}
		}
		public static function getRandomNum(min:Number, max:Number):Number {
			 var num:Number  = Math.floor(Math.random() * (max - min + 1)) + min;
			 return num;
		}
		public static function toRadians(degrees:Number):Number{
			return degrees*Math.PI/180;
		}
		public static function toDegrees(radians:Number):Number{
			return radians*180/Math.PI;
		}
		public static function setSession(name:Number, value:String):void {
			
		}
		public static function isInBrowser():Boolean {
			return Capabilities.playerType == "External" ? false : true;
		}
		public static function isInIE():Boolean {
		/**
		 * In flash - 'External'<br />
		 * In IE - 'ActiveX'<br />
		 * In FF - 'PlugIn'<br />
		 * In Opera - 'PlugIn'<br />
		 * In Safari - 'PlugIn'<br />
		 */
			return Capabilities.playerType == "ActiveX" ? true : false;
			return false;
		}
		public static function get playerType():String {
			return Capabilities.playerType;			
		}
		public static function getPlayerVersion():Array {
			var tmpString:Array = Capabilities.version.split(" ");
			var ver:Array = tmpString[1].split(",");
			ver.push(tmpString[0]);
			return ver;
		}
		public static function getExt(url:String):String {
			var extArr:Array = url.split(".");
			return extArr[extArr.length-1];
		}
		public static function duplicateDisplayObject(target:DisplayObject, autoAdd:Boolean = false):DisplayObject {
			// create duplicate
			var targetClass:Class = Object(target).constructor;
			var duplicate:DisplayObject = new targetClass();
		   
			// duplicate properties
			duplicate.transform = target.transform;
			duplicate.filters = target.filters;
			duplicate.cacheAsBitmap = target.cacheAsBitmap;
			duplicate.opaqueBackground = target.opaqueBackground;
			if (target.scale9Grid) {
				var rect:Rectangle = target.scale9Grid;
				// Flash 9 bug where returned scale9Grid is 20x larger than assigned
				rect.x /= 20, rect.y /= 20, rect.width /= 20, rect.height /= 20;
				duplicate.scale9Grid = rect;
			}
		   
			// add to target parent's display list
			// if autoAdd was provided as true
			if (autoAdd && target.parent) {
				target.parent.addChild(duplicate);
			}
			return duplicate;
		}
		public static function getDisplayObjectsByXY(parent:MovieClip, xPos:Number, yPos:Number, tolerance:Number = 0):Array {
			var objects:Array = [];
			for (var i:Number = 0; i < parent.numChildren; i++) {
				if (
					(xPos - tolerance >= parent.getChildAt(i).x) && 
					(xPos + tolerance <= parent.getChildAt(i).width) && 
					(yPos - tolerance >= parent.getChildAt(i).y) && 
					(yPos + tolerance <= parent.getChildAt(i).height)
				) {
					objects.push(parent.getChildAt(i));
				}
			}
			return objects;
		}
		public static function clone (object:*) : *	{
			object.prototype.clone = function () : * {
					if (typeof (this) == "object")
					{
							var to:* = (this is Array ) ? [] : {};
							for (var i:* in this)
							{
									to[i] = (typeof (this[i]) == "object") ? this[i].clone () : this[i];
							}
							return to;
					}
					trace ("Warning! Object.clone can not be used on MovieClip or XML objects");
					return undefined;
			};
			return object.clone();
		}
		public static function extension(f:String):String {
			var tmp:Array = f.split(".");
			return tmp[tmp.length - 1];
		}
		public static function filename(f:String):String {
			var tmp:Array = f.split(".");
			var res:String = "";
			for (var i:Number = 0; i < tmp.length - 1; i++) {
				res += tmp[i];
				if (i != tmp.length - 2) {
					res += ".";
				}
			}
			return res;
		}
		public static function printObject(ob:*, intervals:String = ""):void {
			Debug.echo("\n\n[object Utils] printObject type=" + (typeof(ob) == "object" ? (ob.length == null ? "object" : "array") : typeof(ob)));
			if(ob.length == null) {
				for (var i: * in ob) {
					trace(intervals + i + "=" + ob[i]);
				}
			} else {
				var numOfElements:int = ob.length;
				for(var j:int=0; j<numOfElements; j++) {
					if(typeof(ob[j]) == "object") {
						printObject(ob[j], intervals + "   ");
					} else {
						trace(intervals + "[" + j + "]=" + ob[j]);
					}
				}
			}
		}
		public static function getType(obj:*):String {
			if(typeof(obj) == "object") {
				if(obj.length == null) {
					return "object";
				} else {
					return "array";
				}
			} else {
				return typeof(obj);
			}
		}
		/**
		 * Create bitmap movie clip from library movie clip
		 * @param	mc must be linked from the library
		 * @return 	MovieClip
		 */
		public static function createRaster(mc:*):MovieClip {
			var b:BitmapData = new BitmapData(mc.width, mc.height, true, 0x00000000);
			b.draw(mc, new Matrix());
			var bit:Bitmap = new Bitmap(b);
			var tmp:MovieClip = new MovieClip();
			tmp.addChild(bit);
			return tmp;
		}
		public static function createObjectByClassName(className:String):* {
			var ClassRef:Class = getDefinitionByName(className) as Class;
			return new ClassRef();
		}
		public static function getTopRoot(movie:*):Stage {
			if(!movie.parent) {
				return movie;
			} else {
				return getTopRoot(movie.parent);
			}
		}
		public static function isValidEmail(email:String):Boolean {
			var EMAIL_REGEX:RegExp = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
            return Boolean(email.match(EMAIL_REGEX));
        }
		public static function matchString(searchFor:String, searchIn:String, caseSensitive:Boolean = true):Boolean {
			//Debug.echo("matchString searchFor=" + searchFor + " searchIn='" + searchIn + "'");
			var flags:String = "";
			if(!caseSensitive) {
				searchFor = searchFor.toLowerCase();
				searchIn = searchIn.toLowerCase();
			}
			var pattern:RegExp = new RegExp("(.*)?" + searchFor + "(.*)?", flags);			
			var res:Object = pattern.exec(searchIn);			
			return res == null ? false : true;
		}
		public static function formatSeconds(seconds:Number):String {
			if(seconds < 60) {
				return seconds < 10 ? "0:0" + seconds : "0:" + seconds;
			} else {
				var minutes:Number = Math.floor(seconds / 60);
				var newSeconds:Number = seconds % 60;
				return "0" + minutes + ":" + (newSeconds < 10 ? "0" + newSeconds : newSeconds);
			}
		}
		public static function formatTimeDigit(digit:Number):String {
			if(digit < 10) {
				return "0" + digit.toString();
			} else {
				return digit.toString();
			}
		}
		public static function formatTime(miliseconds:Number):String {
			var str:String = "";
			var seconds:Number = Math.floor(miliseconds / 1000);
			var minutes:Number = Math.floor(seconds / 60);
			var hours:Number = Math.floor(minutes / 60);
			var days:Number = Math.floor(hours / 24);
			seconds %= 60;
			minutes %= 60;
			hours %= 24;
			
			if(days > 0) {
				str += formatTimeDigit(days) + ":";
			}
			str += formatTimeDigit(hours) + ":";
			str += formatTimeDigit(minutes) + ":";
			str += formatTimeDigit(seconds);
			
			return str;
		}
		/**
		 * 
		 * @param	tags 	["B", "FONT", "SPAN", "h1", "H1"]
		 * @param	str		text
		 * @return	text
		 */
		public static function removeTagsFromString(text:String, tags:Array = null):String {
			if(text.length == 0) {
				return text;
			}
			if(tags == null) {
				var removeHTML:RegExp = new RegExp("<[^>]*>", "gi");
				text = text.replace(removeHTML, "");
			} else {
				var numOfTags:int = tags.length;
				for(var i:int=0; i<numOfTags; i++) {
					var tag:String = tags[i];
					removeHTML = new RegExp("<" + tag + "[^>]*>", "gi");
					text = text.replace(removeHTML, "");
					removeHTML = new RegExp("</" + tag + "[^>]*>", "gi");
					text = text.replace(removeHTML, "");
				}
			}
			return text;
		}
		public static function removeAttributesFromString(text:String, attributes:Array):String {
			if(text.length == 0) {
				return text;
			}
			var numOfAttr:int = attributes.length;
			for(var i:int=0; i<numOfAttr; i++) {
				var attr:String = attributes[i];
				var removeHTML:RegExp = new RegExp(attr + "=\"[0-9a-zA-Z ~!@#$%^&*()_+-]*\"", "gi");
				text = text.replace(removeHTML, "");
			}
			return text;
		}
		public static function activateURLSInString(str:String, window:String = "_blank"):String {			
			var newStr:String = "";
			var tmp:String = "";
			var numOfChars:int = str.length;
			var link:Boolean = false;
			for (var i:int = 0; i < numOfChars; i++) {
				var c1:String = str.charAt(i);
				var c2:String = str.charAt(i + 1 == numOfChars - 1 ? i : i + 1);
				var c3:String = str.charAt(i + 2 == numOfChars - 1 ? i : i + 2);
				var c4:String = str.charAt(i + 3 == numOfChars - 1 ? i : i + 3);
				if (c1 == "h" && c2 == "t" && c3 == "t" && c4 == "p") {
					link = true;
				}
				if (link) {
					if (c1 == " " || i == numOfChars-1 || c1 == "<" || c1 == "\"") {
						if(str.indexOf("\"" + tmp + "\"") == -1 && str.indexOf("'" + tmp + "'") == -1) {
							newStr += "<a href='" + tmp + "' target='" + window + "'>" + tmp + "</a>" + c1;
						} else {
							newStr += tmp + c1;
						}
						link = false;
						tmp = "";
					} else {
						tmp += c1;
					}
				} else {
					newStr += c1;
				}
			}
			return newStr;	
		}
		/**
		 * 
		 * @param	dateStr (day-month-year)
		 */
		public static function isValidDate(dateStr:String):Boolean {
			//Debug.echo("isValidDate dateStr=" + dateStr);
			var tmp:Array = dateStr.split("-");
			var day:Number = Number(tmp[0]);
			var month:Number = Number(tmp[1])-1;
			var year:Number = Number(tmp[2]);
			var date:Date = new Date(year, month, day);
			if(date.getMonth() == month) {
				return true;
			} else {
				return false;
			}
		}
		public static function replaceInString(source:String, searchFor:String, replaceWith:String, caseSensitive:Boolean = true):String {
			var patt:RegExp = new RegExp(searchFor, "g" + (caseSensitive ? "" : "i"));
			return source.replace(patt, replaceWith); 

		}
		public static function formatNumOfDigitsAfterDot(digit:Number, digitsAfterDot:Number = 2):Number {
			var str:String = digit.toString();
			var tmp:Array = str.split(".");
			if(tmp.length <= 1) {
				return digit;
			} else {
				return Number(tmp[0] + "." + String(tmp[1]).substr(0, digitsAfterDot));
			}
		}
		public static function removeAllChildren(movie:MovieClip):void {
			var numOfChilds:int = movie.numChildren;
			while(movie.numChildren > 0) {
				if(movie.getChildAt(0)) {
					if(movie.contains(movie.getChildAt(0))) {
						movie.removeChild(movie.getChildAt(0));
					}
				}
			}
		}
		public static function getCurrentDomain():String {
			return new LocalConnection().domain;
		}
		public static function distanceBetweenPoints(point1:Point, point2:Point):Number {
			return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
		}
		public static function mixArray(arr:Array):void {
			arr.sort(randomSort);
		}
		private static function randomSort(objA:Object, objB:Object):int {
			return Math.round(Math.random() * 2) - 1
		}
		public static function addOutline(obj:DisplayObject, color:uint, thickness:int = 2):void {
			var outline:GlowFilter = new GlowFilter();
			outline.blurX = outline.blurY = thickness;
			outline.color = color;
			outline.quality = BitmapFilterQuality.HIGH;
			outline.strength = 100;
			var filterArray:Array = new Array();
			filterArray.push(outline);
			obj.filters = filterArray;
		}
		public static function correctFloatingPointError(number:Number, precision:int = 2):Number {
			var correction:Number = Math.pow(10, precision);
			return Math.round(correction * number) / correction;
		}
		public static function getShortFloat(n:Number, digitsAfterDot:int = 2):Number {
			var t:int = digitsAfterDot * 10;
			return int((n)*t)/t;
		}

	}
}