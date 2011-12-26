<?php

    /*
    
    {
        "name": "image",
        "presenter": "presenters/File.php",
        "config": {
            "destination": "/assets/uploads"
        }
    }
    
    */

    inject("presenters/Presenter.php");
    inject("tools/view.php");

    class File extends Presenter {
        
        public function __construct($properties = array()) {
            parent::__construct($properties);
            if(!isset($this->config)) {
                $this->config = (object) array(
                    "destination" => "/assets/uploads"
                );
            } else {
                $this->config->destination = isset($this->config->destination) ? $this->config->destination : "/assets/uploads";
            }
        }
        public function __toString() {
            return "File";
        }
        public function listing($value) {
            if($value != "") {
                $this->response = $this->view("listing.html", array(
                    "filepath" => $this->getAbsolutePathHttp($value),
                    "filename" => $this->getFileName($value),
                    "ext" => $this->getExtension($value)
                ));
            } else {
                $this->response = "";
            }
            return $this;
        }
        public function add($default = null) {            
            $this->response = $this->view("adding.html", array(
                "field" => $this->name,
                "value" => $default != null ? $default : "",
            ));
            return $this;
        }
        public function addAction() {
            $this->response = $this->upload($this->name);
            return $this;
        }
        public function edit($value) {
            $this->response = $this->view("editing.html", array(
                "field" => $this->name,
                "listing" => $this->listing($value)->response->value
            ));
            return $this;
        }
        public function editAction($value) {
            $result = $this->upload($this->name);
            if($result != "") {
                $this->deleteAction($value);
                $this->response = $result;
            } else {
                $this->response = $value;
            }
            return $this;
        }
        public function deleteAction($value) {
            if($value != "") {
                $root = $this->req->fabrico->root->files;
                $file = $this->getAbsolutePathFiles($value);
                $fileParts = explode("/", $value);
                $hash = $fileParts[0];
                if(file_exists($file)) {
                    @unlink($file);
                }
                if(file_exists($root.$this->config->destination."/".$hash)) {
                    @rmdir($root.$this->config->destination."/".$hash);
                }
            }
        }
        protected function upload($field) {
            $root = $this->req->fabrico->root->files;
            $hash = md5($field."_".time());
            $fileDir = $root.$this->config->destination."/".$hash;
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
            $root = $this->req->fabrico->root->http;
            return $root.$this->config->destination."/".$value;
        }
        protected function getAbsolutePathFiles($value) {
            $root = $this->req->fabrico->root->files;
            return $root.$this->config->destination."/".$value;
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