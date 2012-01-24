package lib.preloaders {
	
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.events.ProgressEvent;
	import lib.document.App;
	import mx.events.FlexEvent;
	import mx.managers.SystemManager;
	import mx.preloaders.DownloadProgressBar;
	import ws.outset.flex.utils.FlexUtils;
	import ws.outset.utils.Debug;
	import ws.outset.data.Storage;
	import flash.display.Sprite;
	import flash.utils.setTimeout;
	
	public class AppPreloader extends DownloadProgressBar {
		
		[Embed(source="../../assets/Assets.swf", symbol="AppPreloaderClip")]
		private var AppPreloaderClip:Class;
		
		private var _clip:*;
		private var _loaded:Boolean = false;
		private var _shown:Boolean = false;
		private var _sm:SystemManager;
		
		public function AppPreloader() {
			super();
			Debug.echo(this + " constructor");
			_clip = new AppPreloaderClip();
			addChild(_clip);
		}
		public override function set preloader(value:Sprite):void {
			Debug.echo(this + " set preloader");
			
			Storage.addSetting("SystemManager", value.parent);
			_sm = value.parent as SystemManager;
			value.parent.addEventListener(Event.RESIZE, onWindowResize);
			value.addEventListener(ProgressEvent.PROGRESS, onProgress);
            value.addEventListener(FlexEvent.INIT_COMPLETE, onComplete);
			onWindowResize();
			
			FlexUtils.registerSWFVariables(
				this.stage,
				{
					siteURL:""
				}
			);
		}
		private function onProgress(e:ProgressEvent):void {
			Debug.echo(this + " onProgress " + e.bytesLoaded + " / " + e.bytesTotal);
			_clip.gotoAndStop(Math.ceil(e.bytesLoaded/e.bytesTotal*100));
		}
		private function onComplete(e:Event):void {
			Debug.echo(this + " onComplete");
			hidePreloader();
		}
		private function onWindowResize(e:Event = null):void {
			Debug.echo(this + " onWindowResize " + _sm.root.stage.stageWidth + "/" + _sm.root.stage.stageHeight);
			_clip.x = (_sm.root.stage.stageWidth - _clip.width) / 2;
			_clip.y = (_sm.root.stage.stageHeight - _clip.height) / 2;
		}
		private function hidePreloader():void {
			onHidePreloader();
		}
		private function onHidePreloader():void {
			Debug.echo(this + " onHidePreloader");
			_sm.removeEventListener(Event.RESIZE, onWindowResize);
			dispatchEvent(new Event(Event.COMPLETE));
		}
	}
	
}