<?php

    if(!defined("FABRICO_MODULES_DIR")) define("FABRICO_MODULES_DIR", "modules");
    if(!defined("FABRICO_LOADER_CACHE_FILE")) define("FABRICO_LOADER_CACHE_FILE", "loader.cache.php");

    if(!class_exists("FabricoLoader") && php_sapi_name() != "cli") {

        class FabricoLoader {

            private $rootPath = "";
            private $currentPath = "";
            private $loaded;

            public function __construct() {
                $this->loaded = (object) array();
                $this->rootPath = $this->getPath(2);
                if(!file_exists(dirname(__FILE__)."/".FABRICO_LOADER_CACHE_FILE)) {
                    $this->updateCache();
                }
                require(dirname(__FILE__)."/".FABRICO_LOADER_CACHE_FILE);
            }
            public function loaded() {
                return $this->loaded;
            }
            public function loadModule() {
                $this->currentPath = $this->getPath();
                if(func_num_args() === 0) throw new Exception ("Invalid arguments of 'loadModule' method.");
                $modules = func_get_args();
                foreach($modules as $module) {
                    if(!$this->load(str_replace($this->rootPath, "", $this->currentPath).FABRICO_MODULES_DIR."/".$module."/index.php")) {
                        throw new Exception ("Missing module '".$module."'.");
                    }
                }
                return $this;
            }
            public function loadResource() {
                $this->currentPath = $this->getPath();
                if(func_num_args() === 0) throw new Exception ("Invalid arguments of 'loadResource' method.");
                $resources = func_get_args();
                foreach($resources as $resource) {
                    if(!$this->load(str_replace($this->rootPath, "", $this->currentPath).$resource)) {
                        throw new Exception ("Missing resource '".$resource."'.");
                    }
                }
                return $this;
            }
            private function load($resource) {
                $success = true;
                if(!isset($this->loaded->{$this->rootPath.$resource})) {
                    if(!$this->resolvePath($resource)) {
                        $this->updateCache();
                        if(!$this->resolvePath($resource)) {
                            $success = false;
                        }
                    }
                }
                return $success;
            }
            private function getPath($level = 1) {
                $trace = debug_backtrace();
                if(isset($trace[$level])) {
                    return dirname($trace[$level]["file"])."/";
                } else {
                    return dirname($_SERVER["SCRIPT_FILENAME"])."/";
                }
            }
            private function resolvePath($path, $tree = null, $originalPath = "") {
                global $FABRICO_TREE;
                if(is_string($path)) {
                    $path = substr($path, 0, 1) === "/" ? substr($path, 1, strlen($path)) : $path;
                    $path = substr($path, 0, 2) === "./" ? substr($path, 2, strlen($path)) : $path;
                    $originalPath = $path;
                    $path = explode("/", $path);
                }
                if($tree === null) {
                    $tree = $FABRICO_TREE->files;
                }
                $entry = array_shift($path);
                if(isset($tree->$entry)) {
                    if(is_string($tree->$entry) && $tree->$entry === "file") {
                        $this->requireResource($originalPath);
                        return true;
                    } else {
                        return $this->resolvePath($path, $tree->$entry, $originalPath);
                    }
                } else if($entry === "*") {
                    foreach($tree as $key => $value) {
                        if(is_string($value) && $value === "file") {
                            $file = str_replace("/*", "/", $originalPath).$key;
                            $this->requireResource($file);
                        } else {
                            $this->resolvePath(str_replace("/*", "/".$key."/*", $originalPath));
                        }
                    }
                    return true;
                } else {                    
                    return false;
                }
            }
            private function requireResource($file) {
                $this->loaded->{$this->rootPath.$file} = true;
                require($this->rootPath.$file);
            }
            public function updateCache() {
                global $FABRICO_TREE;
                $files = (object) array();
                $this->readDir($this->rootPath, $files);
                $FABRICO_TREE = (object) array(
                    "files" => $files
                );
                $content = '<?php ';
                $content .= 'global $FABRICO_TREE; ';
                $content .= '$FABRICO_TREE = json_decode(\''.json_encode($FABRICO_TREE).'\');';
                $content .= ' ?>';
                file_put_contents(dirname(__FILE__)."/".FABRICO_LOADER_CACHE_FILE, $content);
                chmod(dirname(__FILE__)."/".FABRICO_LOADER_CACHE_FILE, 0777);
            }
            private function readDir($dir, $obj) {
                if ($handle = @opendir($dir)) {
                    $entries = array();
                    while (false !== ($entry = readdir($handle))) {
                        if ($entry != "." && $entry != "..") {
                            $entries []= $entry;
                        }
                    }
                    sort($entries);
                    foreach ($entries as $entry) {
                        if(is_dir($dir."/".$entry)) {
                            $dirPath = str_replace($this->rootPath, "", $dir."/".$entry);
                            $this->readDir($dir."/".$entry, $obj->$entry = (object) array());
                        } else if(is_file($dir."/".$entry)) {
                            if(strpos($entry, ".php") !== FALSE) {
                                $obj->$entry = "file";
                            }
                        }
                    }
                    closedir($handle);
                }
                return $obj;
            }
        }

        global $F;
        $F = new FabricoLoader();

        function fabricoAutoload($class) {
            global $F;
            $F->updateCache();
            $F->loadResource($class);
        }
        spl_autoload_register('fabricoAutoload');

    }

?>