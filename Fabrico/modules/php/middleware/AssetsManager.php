<?php

    require_once("tools/rglob.php");
    require_once("tools/FileJoin.php");
    require_once("Middleware.php");
    
    class AssetsManager extends Middleware {
        
        public $DEBUG = TRUE;
        public $root = "/";

        private $dirs = array();
        private $assets;
        private $hash = "";
        private $req;
        private $res;

        public function __construct() {
            $this->assets = (object) array();
        }
        public function add($asset) {
            $asset = (object) $asset;
            $this->assets->{$asset->name} = (object) array(
                "source" => $asset->source,
                "destination" => $asset->destination,
                "ext" => $asset->extension,
                "hashFile" => $this->root.$asset->destination.$asset->name.".hash",
                "hash" => ""
            );
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $this->req = $req;
            $this->res = $res;
            
            if($this->root == NULL) {
                throw new Exception("AssetsManager: root is undefined (set AssetsManager->root)");
            }
            
            $res->assets = $this;
            foreach($this->assets as $name => $data) {
                $asset = $this->assets->$name;
                if(file_exists($asset->hashFile)) {
                    $asset->hash = file_get_contents($asset->hashFile);
                }
            }
        }
        public function get($name){
        
            $asset = $this->getAsset($name);
            
            if($this->DEBUG == FALSE) {
                // check is there compiled version and use it directly, otherwise compile and use.
                if($asset->hash == "") {
                    $this->compile($name);
                }
                return $this->getTag($asset->destination.$asset->hash.".".$asset->ext, $asset->ext);
            }
            
            $asset->source = is_array($asset->source) ? $asset->source : array($asset->source);
            
            $result = "";
            foreach($asset->source as $dir) {
                $files = rglob($this->root.$dir);
                foreach($files as $file) {
                    $file = str_replace($this->root, "", $file);
                    $result .= $this->getTag($file, $asset->ext);
                }
            }

            // always re-compile assets if not in debug mode
            $this->compile($name);
      
            return $result;
        }
        public function compile($name) {
        
            $asset = $this->getAsset($name);
        
            if($asset->hash != "") {
                if(file_exists($asset->hashFile)) {
                    unlink($asset->hashFile);
                }
                if(file_exists($this->root.$asset->destination.$asset->hash.".".$asset->ext)) {
                    unlink($this->root.$asset->destination.$asset->hash.".".$asset->ext);
                }
            }

            $joiner = new FileJoin($this->root);
            $content = $joiner->run($asset->source);
            $asset->hash = md5($content);
            file_put_contents($asset->hashFile, $asset->hash);
            file_put_contents($this->root.$asset->destination.$asset->hash.".".$asset->ext, $content);
            
        }
        private function getAsset($name) {
            $asset = isset($this->assets->$name) ? $this->assets->$name : null;
            if($asset == null) {
                throw new Exception("Missing asset with name = '".$name."'");
            }
            return $asset;
        }
        private function getTag($file, $ext) {
            $file = $this->req->host.($this->req->base == "/" ? "" : $this->req->base).$this->req->fabrico->config->get("fabrico.paths.files").$file;
            switch($ext) {
                case "js":
                    return '<script src="'.$file.'"></script>';
                break;
                case "css":
                    return '<link rel="stylesheet" href="'.$file.'" />';
                break;
                default:
                    return $file;
                break;
            }                
        }
    
    };

?>