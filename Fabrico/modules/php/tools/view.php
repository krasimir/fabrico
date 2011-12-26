<?php
/**
* @package Fabrico\Modules\Tools
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
* @package Fabrico\Modules\Tools
*/
class ViewConfig {
    public static $root = "";
    public static $searchIn = array();
    public static $debug = false;
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
}
/**
* @package Fabrico\Modules\Tools
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
            if(ViewConfig::$debug) {
                var_dump("view: ".str_replace($root, "", $path));
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

		return $output;
	}
}

/**
*	helper global function
*	@returns View
*/
function view($path, $data = array(), $searchIn = null) {
	return new View($path, $data, $searchIn);
}
?>