package ws.outset.data {
	
	import ws.outset.utils.Debug;
	import ws.outset.utils.Utils;
	
	public class Storage {
			
		private static var _settings:Array;
		private static var _strings:Array;
		private static var _objects:Array;
		private static var _language:String = "default";
		
		public static function addSetting(param:String, value:*):void {			
			if(!_settings) {
				_settings = new Array();
			}
			_settings.push({param:param, value:value});			
		}
		public static function getSetting(param:String):* {
			if(_settings) {
				var numOfSettings:int = _settings.length; 
				for(var i:int=0; i<numOfSettings; i++) {
					if(_settings[i].param == param) {
						return _settings[i].value;
					}
				}
				Debug.echo("Storage Missing setting " + param + " in storage !");				
			} else {
				Debug.echo("Storage Missing setting " + param + " in storage !");
			}
			return "";
		}
		public static function editSetting(param:String, value:*):void {
			if(_settings) {
				var numOfSettings:int = _settings.length; 
				for(var i:int=0; i<numOfSettings; i++) {
					if(_settings[i].param == param) {
						_settings[i].value = value;
						return;
					}
				}
				Storage.addSetting(param, value);
			} else {
				Debug.echo("Storage missing _settings !");
			}
		}
		public static function addText(nameOfString:String, text:String, language:String = "default"):void {
			if(!_strings) {
				_strings = new Array();
			}
			_strings.push({nameOfString:nameOfString, text:text, language:language});
		}
		public static function getText(nameOfString:String):String {
			if(_strings) {
				var numOfString:int = _strings.length; 
				for(var i:int=0; i<numOfString; i++) {
					if(_strings[i].nameOfString == nameOfString && _strings[i].language == _language) {
						return _strings[i].text;
					}
				}
				Debug.echo("Storage Missing text " + nameOfString + " in storage !");				
			} else {
				Debug.echo("Storage Missing text " + nameOfString + " in storage !");
			}
			return "";
		}
		public static function editText(nameOfString:String, text:String, language:String = "default"):void {
			if(_strings) {
				var numOfString:int = _strings.length; 
				for(var i:int=0; i<numOfString; i++) {
					if(_strings[i].nameOfString == nameOfString && _strings[i].language == language) {
						_strings[i].text = text;
						return;
					}
				}
				Storage.addText(nameOfString, text, language);
			} else {
				Debug.echo("Storage missing settings !");
			}
		}
		public static function addObject(nameOfObject:String, obj:*, language:String = "default"):void {
			if(!_objects) {
				_objects = new Array();
			}
			_objects.push({nameOfObject:nameOfObject, obj:obj, language:language});
		}
		public static function getObject(nameOfObject:String):* {
			if(_objects) {
				var numOfObjects:int = _objects.length; 
				for(var i:int=0; i<numOfObjects; i++) {
					if(_objects[i].nameOfObject == nameOfObject && _objects[i].language == _language) {
						return _objects[i].obj;
					}
				}
				Debug.echo("Storage Missing object " + nameOfObject + " in storage !");				
			} else {
				Debug.echo("Storage Missing object " + nameOfObject + " in storage !");
			}
			return "";
		}
		public static function editObject(nameOfObject:String, obj:*, language:String = "default"):void {
			if(_objects) {
				var numOfObjects:int = _objects.length; 
				for(var i:int=0; i<numOfObjects; i++) {
					if(_objects[i].nameOfObject == nameOfObject && _objects[i].language == language) {
						_objects[i].obj = obj;
						return;
					}
				}
				Storage.addObject(nameOfObject, obj, language);				
			} else {
				Debug.echo("Storage missing _objects !");
			}
		}
		public static function get language():String {
			return _language;
		}
		public static function set language(l:String):void {
			_language = l;
		}
		public static function printSettings():void {
			Debug.echo("Storage.printSettings");
			if(_settings) {
				var numOfSettings:int = _settings.length; 
				for(var i:int=0; i<numOfSettings; i++) {
					Debug.echo(i + ". " + _settings[i].param + "=" + _settings[i].value);
				}
			} else {
				Debug.echo("Storage: No settings in Storage");
			}
		}
		public static function printStrings():void {
			Debug.echo("Storage.printStrings");
			if(_strings) {
				var numOfString:int = _strings.length; 
				for(var i:int=0; i<numOfString; i++) {
					Debug.echo((i+1) + "). " + _strings[i].str + " language=" + _strings[i].language + " text=" + _strings[i].text);
				}
			} else {
				Debug.echo("Storage: No strings in Storage");
			}
		}
		public static function clear():void {
			_settings = [];
			_strings = [];
			_objects = [];
		}
	}
	
}