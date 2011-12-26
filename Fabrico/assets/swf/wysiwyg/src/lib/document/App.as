package lib.document {
	
	import flash.display.MovieClip;
	import flash.events.Event;
    import flash.text.TextField;
	import mx.containers.Canvas;
	import mx.controls.RichTextEditor;
	import mx.core.UIComponent;
	import ws.outset.data.Storage;
	import ws.outset.flex.utils.FlexUtils;
	import ws.outset.utils.Debug;
	import ws.outset.utils.Utils;
	import flash.external.ExternalInterface;
	
	public class App extends Canvas {
		
		private var _editor:RichTextEditor;
		private var _textToSend:String;
		private var _field:String;
		private var _defaultText:String;
				
		public function App() {
			Debug.echo(this + " constructor");
            
            var root:* = Storage.getSetting("root");
			
			root.addChild(this);
			
			_field = root.loaderInfo.parameters.field || "null";
			
			percentWidth = percentHeight = 100;
			
			_editor = new RichTextEditor();
			_editor.title = "Text:"
			_editor.percentWidth = _editor.percentHeight = 100;
			_editor.addEventListener(Event.CHANGE, onTextChange);
			addChild(_editor);
			
            if(root.loaderInfo.parameters.fontFamily && root.loaderInfo.parameters.fontFamily == "no") {
                _editor.toolbar.removeChild(_editor.fontFamilyCombo);
            }
            if(root.loaderInfo.parameters.bullets && root.loaderInfo.parameters.bullets == "no") {
                _editor.toolbar.removeChild(_editor.bulletButton);
            }
            if(root.loaderInfo.parameters.linkInput && root.loaderInfo.parameters.linkInput == "no") {
                _editor.toolbar.removeChild(_editor.linkTextInput);
            }
            if(root.loaderInfo.parameters.fontSize && root.loaderInfo.parameters.fontSize == "no") {
                _editor.toolbar.removeChild(_editor.fontSizeCombo);
            }
            if(root.loaderInfo.parameters.colorPicker && root.loaderInfo.parameters.colorPicker == "no") {
                _editor.toolbar.removeChild(_editor.colorPicker);
            }
            if(root.loaderInfo.parameters.alignButtons && root.loaderInfo.parameters.alignButtons == "no") {
                _editor.toolbar.removeChild(_editor.alignButtons);
            }   
            if(root.loaderInfo.parameters.bold && root.loaderInfo.parameters.bold == "no") {
                _editor.toolBar2.removeChild(_editor.boldButton);
            }    
            if(root.loaderInfo.parameters.italic && root.loaderInfo.parameters.italic == "no") {
                _editor.toolBar2.removeChild(_editor.italicButton);
            }    
            if(root.loaderInfo.parameters.underline && root.loaderInfo.parameters.underline == "no") {
                _editor.toolBar2.removeChild(_editor.underlineButton);
            }           
			
			if(FlexUtils.isInBrowser()) {
				ExternalInterface.addCallback("setText", receiveText);
				ExternalInterface.call("global.fabrico.modules.workers.TextRich.getDefaultText", _field);
			}
			
		}
		private function onTextChange(e:Event):void {
			var str:String = _editor.htmlText;
			str = Utils.removeTagsFromString(str, ["TEXTFORMAT"]);
			str = Utils.removeAttributesFromString(str, ["SIZE", "FACE"]);
			str = Utils.replaceInString(str, " LETTERSPACING=\"0\"", "", false);
			str = Utils.replaceInString(str, " KERNING=\"0\"", "", false);
			send(str);
		}
		private function send(str:String):void {
			Debug.echo(className + " send str=" + str);
			if(FlexUtils.isInBrowser()) {
				ExternalInterface.call("global.fabrico.modules.workers.TextRich.onTextChange", _field, str);
			}
		}
		private function receiveText(str:String):void {
			_editor.htmlText = str;
			send(str);
		}
	}
	
}