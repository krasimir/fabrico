package ws.outset.flex.utils {
	
	import flash.display.DisplayObject;
	import flash.display.Stage;
	import mx.controls.Tree;
	import mx.core.UIComponent;
	import ws.outset.data.Storage;
	import ws.outset.utils.Debug;
	import ws.outset.utils.Utils;
	import flash.system.Capabilities;
	
	public class FlexUtils {
		
		public static function getUIComponent(obj:*):UIComponent {
			var c:UIComponent = new UIComponent();
			c.addChild(obj);
			return c;
		}
		public static function nl2br(str:String):String {
			str = str.replace(/\r/g, "<br />");
			str = str.replace(/\n/g, "<br />");
			return str;
		}
		public static function registerSWFVariables(stage:Stage, defaultValues:Object = null):void {
			var parameters:Object = stage.loaderInfo.parameters;
			var added:Array = [];
			if(parameters) {
				if(defaultValues) {
					for(var j:* in defaultValues) {
						Storage.addSetting(j, defaultValues[j]);
						added.push(j);
					}
				}
				for (var i: * in parameters) {
					var numOfAdded:int = added.length;
					var edited:Boolean = false;
					for(var k:int=0; k<numOfAdded; k++) {
						if(added[k] == i) {
							edited = true;
							Storage.editSetting(i, parameters[i]);
						}
					}
					if(!edited) {
						Storage.addSetting(i, parameters[i]);
					}
				}
			}
		}
		public static function isInBrowser():Boolean {
			return Capabilities.playerType == "StandAlone" ? false : true;
		}
		public static function expandAllItemsInTree(tree:Tree, dataProvider:Array):void {
			tree.validateNow();
			var numOfChilds:int = dataProvider.length;
			for(var i:int=0; i<numOfChilds; i++) {
				tree.expandChildrenOf(dataProvider[i], true);
				if(dataProvider[i].children && dataProvider[i].children.length > 0) {
					expandAllItemsInTree(tree, dataProvider[i].children);
				}
			}
		}
		
	}
	
}