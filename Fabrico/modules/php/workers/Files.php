<?php

    /*
    
    The following configuration must be added in /config/config.json:
    "workers": {
        [your custom key here]: {
            "destination": "[path]"
        )
    }
    
    */

    require_once("workers/File.php");
    require_once("tools/view.php");

    class Files extends File {
        
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
                                "field" => $this->field,
                                "id" => md5($file)
                            ))
                        ));
                    }
                }
                return $result;
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
            $numOfFields = $this->req->body->{strtolower($this->field."_numOfFields")};
            $files = array();
            $files []= $this->upload($this->field);
            for($i=0; $i<$numOfFields; $i++) {
                $files []= $this->upload($this->field."_".$i);
            }
            $result = "";
            if(!empty($files)) {
                foreach($files as $file) {
                    if($file != "") {
                        $result .= $file."|";
                    }
                }
            }
            return $result;
        }
        public function edit($value) {
            return $this->view("editing.html", array(
                "field" => $this->field,
                "current" => $this->listing($value, true),
                "adding" => $this->add()
            ));
        }
        public function editAction($value) {
            $newFiles = $this->addAction();
            $oldFiles = "";
            if($value != "") {
                $files = explode("|", $value);
                $filesToRemove = $this->req->body->{strtolower($this->field."_filesToRemove")};
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
            return ($newFiles != "" ? $newFiles."|" : "").$oldFiles;
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
        }
    
    }
    
?>