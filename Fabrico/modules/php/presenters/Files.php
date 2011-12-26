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

    inject(array(
        "presenters/File.php",
        "tools/view.php"
    ));

    class Files extends File {
        
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
            return "Files";
        }
        public function listing($value, $remove = false) {
            if($value != "") {
                $files = explode("|", $value);
                $result = "";
                foreach($files as $file) {
                    if($file != "") {
                        $result .= $this->view("listing.html", array(
                            "filepath" => $this->getAbsolutePathHttp($file),
                            "filename" => $this->getFileName($file),
                            "ext" => $this->getExtension($file),
                            "remove" => !$remove ? "" : $this->view("remove.html", array(
                                "field" => $this->name,
                                "id" => md5($file)
                            ))
                        ));
                    }
                }
                $this->response = $result;
            } else {
                $this->response = $value;
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
            $numOfFields = $this->req->body->{strtolower($this->name."_numOfFields")};
            $files = array();
            $files []= $this->upload($this->name);
            for($i=0; $i<$numOfFields; $i++) {
                $files []= $this->upload($this->name."_".$i);
            }
            $result = "";
            if(!empty($files)) {
                foreach($files as $file) {
                    if($file != "") {
                        $result .= $file."|";
                    }
                }
            }
            $this->response = $result;
            return $this;
        }
        public function edit($value) {
            $this->response = $this->view("editing.html", array(
                "field" => $this->name,
                "current" => $this->listing($value, true)->response->value,
                "adding" => $this->add()->response->value
            ));
            return $this;
        }
        public function editAction($value) {
            $newFiles = $this->addAction()->response->value;
            $oldFiles = "";
            if($value != "") {
                $files = explode("|", $value);
                $filesToRemove = $this->req->body->{strtolower($this->name."_filesToRemove")};
                $filesToRemove = explode("|", $filesToRemove);
                foreach($files as $file) {
                    if($file != "") {
                        $found = false;
                        foreach($filesToRemove as $fileToRemove) {
                            if($fileToRemove == md5($file)) {
                                $found = true;
                                parent::deleteAction($file);
                            }
                        }
                        if(!$found) {
                            $oldFiles .= $file."|";
                        }
                    }
                }
            }
            $this->response = ($newFiles != "" ? $newFiles."|" : "").$oldFiles;
            return $this;
        }
        public function deleteAction($value) {
            if($value != "") {
                $files = explode("|", $value);
                $result = "";
                foreach($files as $file) {
                    if($file != "") {
                        parent::deleteAction($file);
                    }
                }
            }
            return $this;
        }
    
    }
    
?>