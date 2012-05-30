<?php
/**
* @package Fabrico\Library\Utils
*/
class ViewCache {
    private static $cache;
    public static function add($file, $content) {
        if(self::$cache == NULL) {
            self::$cache = (object) array();
        }
        self::$cache->$file = $content;
    }
    public static function get($file) {
        if(isset(self::$cache->$file)) {
            return self::$cache->$file;
        } else {
            return false;
        }
    }
}
/**
* @package Fabrico\Library\Utils
*/
class ViewConfig {
    public static $root = "";
    public static $searchIn = array();
    public static $globalData;
    public static function config($configs) {
        foreach($configs as $key => $value) {
            if($key == "searchIn") {
                if(!is_array($value)) {
                    $value = array($value);
                }
            }
            self::$$key = $value;
        }
    }
    public static function addGlobalData($arr) {
        if(!isset(self::$globalData)) {
            self::$globalData = array();
        }
        self::$globalData = array_merge(self::$globalData, (array) $arr);
    }
}
/**
* @package Fabrico\Library\Utils
*/
class View {

	/**
	*	template file contents ({placeholders} are not replaced with values)
	*/
	public $tplFileContent = NULL;
	/**
	* 	assoc array containing key => value which will be used for populating the template
	*/
	public $vars = array();

	public function __construct($path, $data, $searchIn) {
        
        $root = ViewConfig::$root;
        $searchInDefault = ViewConfig::$searchIn;
        
        if($searchIn != null) {
            if(!is_array($searchIn)) {
                $searchIn = array($searchIn);
            }
        } else {
            $searchIn = array();
        }
        if(!empty($searchInDefault)) {
            $searchIn = array_merge($searchIn, $searchInDefault);
        }
       
        $foundInSearchIn = false;
        foreach($searchIn as $search) {
            $searchPath = $root.$search."/".$path;
            if(file_exists($searchPath)) {
                $path = $searchPath;
                $foundInSearchIn = true;
                break;
            }
        }
        if(!$foundInSearchIn) {
            $path = $root.$path;
        }
        
        $cache = ViewCache::get($path);
            
        if(!$cache) {
            
            if(defined("DEBUG") && DEBUG) {
               $this->log("view: ".str_replace($root, "", $path), "#BEC7B1");
            }
            $fh = @fopen($path, "r");
            if(!$fh) {
                throw new ErrorException("Missing file '".$path."'.");
            }
            $this->tplFileContent = fread($fh, filesize($path));
            fclose($fh);
            ViewCache::add($path, $this->tplFileContent);
        } else {
            $this->tplFileContent = $cache;
        }

		$this->vars = $data;
	}
	public function __toString() {	
	
		// adding assigned variabls
		$output = $this->tplFileContent; // TODO is this by copy or reference?
		foreach($this->vars as $key => $value) {
			$output = str_replace("{".$key."}", $value, $output);
		}
        
        // adding default assigned variabls
        $globalData = ViewConfig::$globalData;
        if(isset($globalData)) {
            foreach($globalData as $key => $value) {
                $output = str_replace("{".$key."}", $value, $output);
            }
        }

		return $output;
	}
    private function log($str, $color) {
        echo '<div class="debug" style="background:'.$color.'">'.$str.'</div>';
    }
}

/**
*	helper function
*	@returns View
*/
function view($path, $data = array(), $searchIn = null) {
	return new View($path, $data, $searchIn);
}

/**
*	helper function
*	@returns View
*/
function forEachView($arr) {    
	ViewConfig::addGlobalData($arr);
}
?>