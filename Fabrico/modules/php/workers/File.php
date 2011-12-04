<?php

    /*
    
    The following configuration must be added in /config/config.json:
    "workers": {
        [your custom key here]: {
            "destination": "[path]"
        )
    }
    
    */

    require_once("workers/Worker.php");
    require_once("tools/view.php");

    class File extends Worker {
        
        public function __toString() {
            return "File";
        }
        public function listing($value) {
            if($value != "") {
                return $this->view("listing.html", array(
                    "filepath" => $this->getAbsolutePathHttp($value),
                    "filename" => $this->getFileName($value),
                    "ext" => $this->getExtension($value)
                ));
            }
            return $value;
        }
        public function add() {            
            return $this->view("adding.html", array(
                "field" => $this->field,
                "value" => ""
            ));
        }
        public function addAction() {
            return $this->upload($this->field);
        }
        public function edit($value) {
            return $this->view("editing.html", array(
                "field" => $this->field,
                "listing" => $this->listing($value)
            ));
        }
        public function editAction($value) {
            $result = $this->upload($this->field);
            if($result != "") {
                $this->deleteAction($value);
                return $result;
            }
            return $value;
        }
        public function deleteAction($value) {
            if($value != "") {
                $config = $this->getConfig();
                $root = $this->req->fabrico->root->files;
                $file = $this->getAbsolutePathFiles($value);
                $fileParts = explode("/", $value);
                $hash = $fileParts[0];
                if(file_exists($file)) {
                    @unlink($file);
                }
                if(file_exists($root.$config->destination."/".$hash)) {
                    @rmdir($root.$config->destination."/".$hash);
                }
            }
        }
        protected function upload($field) {
            $config = $this->getConfig();
            $root = $this->req->fabrico->root->files;
            $hash = md5($field."_".time());
            $fileDir = $root.$config->destination."/".$hash;
            if(isset($_FILES) && isset($_FILES[$field]) && $_FILES[$field]["tmp_name"] != "") {
                $file = $_FILES[$field]["name"];
                if(mkdir($fileDir, 0777)) {
                    if(move_uploaded_file($_FILES[$field]["tmp_name"], $fileDir."/".$file)) {
                        return $hash."/".$file;
                    }
                }
            }
            return "";
        }
        protected function getAbsolutePathHttp($value) {
            $config = $this->getConfig();
            $root = $this->req->fabrico->root->http;
            return $root.$this->getConfig()->destination."/".$value;
        }
        protected function getAbsolutePathFiles($value) {
            $config = $this->getConfig();
            $root = $this->req->fabrico->root->files;
            return $root.$this->getConfig()->destination."/".$value;
        }
        protected function getFileName($value) {
            $parts = explode("/", $value);
            return array_pop($parts);
        }
        protected function getExtension($value) {
            $expParts = explode(".", $value);
            return strtolower(array_pop($expParts));
        }
    
    }
    
?>