
if(typeof deconcept == "undefined") var deconcept = new Object();
if(typeof deconcept.util == "undefined") deconcept.util = new Object();
if(typeof deconcept.SWFObjectUtil == "undefined") deconcept.SWFObjectUtil = new Object();
deconcept.SWFObject = function(swf, id, w, h, ver, c, useExpressInstall, quality, xiRedirectUrl, redirectUrl, detectKey){
	if (!document.createElement || !document.getElementById) { return; }
	this.DETECT_KEY = detectKey ? detectKey : 'detectflash';
	this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
	this.params = new Object();
	this.variables = new Object();
	this.attributes = new Array();
	this.jsfc = new JSFCommunicator();
	if(swf) { this.setAttribute('swf', swf); }
	if(id) { this.setAttribute('id', id); }
	if(w) { this.setAttribute('width', w); }
	if(h) { this.setAttribute('height', h); }
	if(ver) { this.setAttribute('version', new deconcept.PlayerVersion(ver.toString().split("."))); }
	this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion(this.getAttribute('version'), useExpressInstall);
	if(c) { this.addParam('bgcolor', c); }
	var q = quality ? quality : 'high';
	this.addParam('quality', q);
	this.setAttribute('useExpressInstall', useExpressInstall);
	this.setAttribute('doExpressInstall', false);
	var xir = (xiRedirectUrl) ? xiRedirectUrl : window.location;
	this.setAttribute('xiRedirectUrl', xir);
	this.setAttribute('redirectUrl', '');
	if(redirectUrl) { this.setAttribute('redirectUrl', redirectUrl); }
}
deconcept.SWFObject.prototype = {
	setVariable: function(name, value){
		this.jsfc.setVariable(name, value);
	},
	callFunction: function(fnLocation, fnName, fnArgs){
		//jsfc.callFunction(“_root”,“myFlashFunction”,[“param1”,”param2”]);
		this.jsfc.callFunction(fnLocation, fnName, fnArgs);
	},
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},
	getAttribute: function(name){
		return this.attributes[name];
	},
	addParam: function(name, value){
		this.params[name] = value;
	},
	getParams: function(){
		return this.params;
	},
	addVariable: function(name, value){
		this.variables[name] = value;
	},
	getVariable: function(name){
		return this.variables[name];
	},
	getVariables: function(){
		return this.variables;
	},
	getVariablePairs: function(){
		var variablePairs = new Array();
		var key;
		var variables = this.getVariables();
		for(key in variables){
			variablePairs.push(key +"="+ variables[key]);
		}
		return variablePairs;
	},
	getSWFHTML: function() {
		var swfNode = "";
		if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) { // netscape plugin architecture
			if (this.getAttribute("doExpressInstall")) this.addVariable("MMplayerType", "PlugIn");
			swfNode = '<embed type="application/x-shockwave-flash" src="'+ this.getAttribute('swf') +'" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'"';
			swfNode += ' id="'+ this.getAttribute('id') +'" name="'+ this.getAttribute('id') +'" ';
			var params = this.getParams();
			 for(var key in params){ swfNode += [key] +'="'+ params[key] +'" '; }
			var pairs = this.getVariablePairs().join("&");
			 if (pairs.length > 0){ swfNode += 'flashvars="'+ pairs +'"'; }
			swfNode += '/>';
		} else { // PC IE
			if (this.getAttribute("doExpressInstall")) this.addVariable("MMplayerType", "ActiveX");
			swfNode = '<object id="'+ this.getAttribute('id') +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'">';
			swfNode += '<param name="movie" value="'+ this.getAttribute('swf') +'" />';
			var params = this.getParams();
			for(var key in params) {
			 swfNode += '<param name="'+ key +'" value="'+ params[key] +'" />';
			}
			//swfNode += '<param name="wmode" value="transparent" />';
			var pairs = this.getVariablePairs().join("&");
			if(pairs.length > 0) {swfNode += '<param name="flashvars" value="'+ pairs +'" />';}
			swfNode += "</object>";
		}
		return swfNode;
	},
	write: function(elementId){
		if(this.getAttribute('useExpressInstall')) {
			// check to see if we need to do an express install
			var expressInstallReqVer = new deconcept.PlayerVersion([6,0,65]);
			if (this.installedVer.versionIsValid(expressInstallReqVer) && !this.installedVer.versionIsValid(this.getAttribute('version'))) {
				this.setAttribute('doExpressInstall', true);
				this.addVariable("MMredirectURL", escape(this.getAttribute('xiRedirectUrl')));
				document.title = document.title.slice(0, 47) + " - Flash Player Installation";
				this.addVariable("MMdoctitle", document.title);
			}
		}
		if(this.skipDetect || this.getAttribute('doExpressInstall') || this.installedVer.versionIsValid(this.getAttribute('version'))){
			var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
			n.innerHTML = this.getSWFHTML();
			this.jsfc.setMovie(getMovie(this.getAttribute('id')));
			return true;
		}else{
			if(this.getAttribute('redirectUrl') != "") {
				document.location.replace(this.getAttribute('redirectUrl'));
			}
		}
		return false;
	}
}

/* ---- detection functions ---- */
deconcept.SWFObjectUtil.getPlayerVersion = function(reqVer, xiInstall){
	var PlayerVersion = new deconcept.PlayerVersion([0,0,0]);
	if(navigator.plugins && navigator.mimeTypes.length){
		var x = navigator.plugins["Shockwave Flash"];
		if(x && x.description) {
			PlayerVersion = new deconcept.PlayerVersion(x.description.replace(/([a-z]|[A-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
		}
	}else{
		try{
			var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			for (var i=3; axo!=null; i++) {
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+i);
				PlayerVersion = new deconcept.PlayerVersion([i,0,0]);
			}
		}catch(e){}
		if (reqVer && PlayerVersion.major > reqVer.major) return PlayerVersion; // version is ok, skip minor detection
		// this only does the minor rev lookup if the user's major version 
		// is not 6 or we are checking for a specific minor or revision number
		// see http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
		if (!reqVer || ((reqVer.minor != 0 || reqVer.rev != 0) && PlayerVersion.major == reqVer.major) || PlayerVersion.major != 6 || xiInstall) {
			try{
				PlayerVersion = new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
			}catch(e){}
		}
	}
	return PlayerVersion;
}
deconcept.PlayerVersion = function(arrVersion){
	this.major = parseInt(arrVersion[0]) != null ? parseInt(arrVersion[0]) : 0;
	this.minor = parseInt(arrVersion[1]) || 0;
	this.rev = parseInt(arrVersion[2]) || 0;
}
deconcept.PlayerVersion.prototype.versionIsValid = function(fv){
	if(this.major < fv.major) return false;
	if(this.major > fv.major) return true;
	if(this.minor < fv.minor) return false;
	if(this.minor > fv.minor) return true;
	if(this.rev < fv.rev) return false;
	return true;
}
/* ---- get value of query string param ---- */
deconcept.util = {
	getRequestParameter: function(param){
		var q = document.location.search || document.location.hash;
		if(q){
			var startIndex = q.indexOf(param +"=");
			var endIndex = (q.indexOf("&", startIndex) > -1) ? q.indexOf("&", startIndex) : q.length;
			if (q.length > 1 && startIndex > -1) {
				return q.substring(q.indexOf("=", startIndex)+1, endIndex);
			}
		}
		return "";
	}
}

/* fix for video streaming bug */
/*
deconcept.SWFObjectUtil.cleanupSWFs = function() {
	var objects = document.getElementsByTagName("OBJECT");
	for (var i=0; i < objects.length; i++) {
		for (var x in objects[i]) {
			if (typeof objects[i][x] == 'function') {
				objects[i][x] = null;
			}
		}
	}
}
if (typeof window.onunload == 'function') {
	var oldunload = window.onunload;
		window.onunload = function() {
		deconcept.SWFObjectUtil.cleanupSWFs();
		oldunload();
	}
} else {
	window.onunload = deconcept.SWFObjectUtil.cleanupSWFs;
}
*/

/* add Array.push if needed (ie5) */
if (Array.prototype.push == null) { Array.prototype.push = function(item) { this[this.length] = item; return this.length; }}

/* add some aliases for ease of use/backwards compatibility */
var getQueryParamValue = deconcept.util.getRequestParameter;
var FlashObject = deconcept.SWFObject; // for legacy support
var SWFObject = deconcept.SWFObject;



/***************************************************************************************/
/***************************************************************************************/
/***************************************************************************************/
/*

 * CLASS: JSFCommunicator
 * AUTHOR: Abdul Qabiz 
 * DATE  : 12/13/2003
	
 * @constructor JSFCommunicator
 * @param flashMovie:Refrence to activeX or Plugin
 * @description This is constructor function of JSFCommunicator class

*/

function JSFCommunicator(flashMovie)
{	
	this.init(flashMovie);
}

/**
 * @method init()
 * @param flashMovie:Reference to ActiveX or Plugin object
 * @return none
 * @description initializes all variables for communication
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/
JSFCommunicator.prototype.init = function(flashMovie) {

	if(flashMovie=="undefined") {
		var flashMovie = null;
	 }
	this.setMovie(flashMovie);
	this.functionToCall = null;
	this.functionLocationinFlash = null;
	this.functionArgs = null;
}


/**
 * @method setMovie(flashMovie)
 * @param flashMovie:Reference to ActiveX or Plugin object
 * @return none
 * @description initializes all variables for communication
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/

JSFCommunicator.prototype.setMovie = function(flashMovie)
{
	this.flashMovie = flashMovie;
}


/**
 * @method setVariable(propName,propValue)
 * @param propName:String, variable name in flash to be set.
 * @param propValue:any primitive type
 * @return none
 * @description Sets a variable in flash
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/
JSFCommunicator.prototype.setVariable  = function(propName, propValue) {
	this.flashMovie.SetVariable(propName,propValue);
}



/**
 * @method getVariable(propName)
 * @param propName:String, variable name in flash
 * @return Any primitive value
 * @description Gets a specified properties value from flash
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/
JSFCommunicator.prototype.getVariable  = function(propName) {
	var result = this.flashMovie.GetVariable(propName);
	return result;
}


/**
 * @method callFunction(fnLocation,fnName, fnArgs)
 * @param fnLocation:String, funtion's parent objects path in flash. e.g. _root or _level0 or _level0.my_mc etc
 * @param fnName:String, name of flash function be executed
 * @param fnArgs:Array, parameters to be passed to flash function. only primitive data can be passed
 * @return Boolean, depending upon the success or failure of the call made
 * @description calls a specified flash function from javascript
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/
JSFCommunicator.prototype.callFunction = function(fnLocation,fnName,fnArgs) {

	if(this.flashMovie==null) {	return false; }
	
//	get the current value of triggerFn from flash
	var flag = this.getVariable("/:triggerFn");
	var result = false;

//	if no function name passed, return false
	if(fnName=="") {return false; }
//	if 	fnLocation is not proper, set it to _level0 as default
	if(fnLocation=="") {
		var fnLocation = "_level0";
	}

	this.setVariable("/:fnLocation",fnLocation);
	this.setVariable("/:fnName",fnName);
	
//	check if fnArgs is an array
	if(typeof(fnArgs)=="object") {
//		convert it to $@$$-delemited string and pass to flash
		this.setVariable("/:fnArgs",fnArgs.join("$@$$"));
	}else if(typeof(fnArgs)=="number" || typeof(fnArgs)=="string") {
		this.setVariable("/:fnArgs",fnArgs);
	}
	
//	change triggerFn property in flash which being watched
	this.setVariable("/:triggerFn",!flag);

//	check if function in flash called successfully or not.
	result = this.getVariable("triggerFnStatus");
	
//	set triggerFnStatus false again.
	this.setVariable("/:triggerFnStatus",false);

//	return result of call.
	return result;

	
}

//======================================================


function getMovie(movieName) {
	return document.getElementById(movieName);
}