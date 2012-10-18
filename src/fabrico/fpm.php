<?php

    class FabricoPackageManager {

        private $gitEndPoint = "https://api.github.com/";
        private $gitEndPointRaw = "https://raw.github.com/";
        private $gitRepos;
        private $installedModules;

        private $packageFileName = "package.json";
        private $modulesDir = "modules";

        public function __construct() {
            global $APP_ROOT;
            $this->gitRepos = (object) array();
            $this->installedModules = (object) array();
            $this->installModules($APP_ROOT.$this->packageFileName);
        }
        private function installModules($packageFile, $indent = 0) {
            global $APP_ROOT;
            if(file_exists($packageFile)) {
                $this->log("/".str_replace($APP_ROOT, "", $packageFile), "CYAN", $indent);
                $sets = json_decode(file_get_contents($packageFile));
                foreach($sets as $set) {                    
                    if($this->shouldContain($set, array("owner", "repository", "modules", "branch")) && $this->shouldBeNonEmptyArray($set->modules)) {
                        $this->log("/".$set->owner."/".$set->repository, "", $indent + 1);
                        $dir = dirname($packageFile)."/".$this->modulesDir;
                        if(!file_exists($dir)) {
                            mkdir($dir, 0777);
                        }
                        foreach($set->modules as $module) {
                            $this->installModule($module, $set, $dir, $indent);
                        }
                    }
                }
            } else {
                $this->warning("Directory '".dirname($packageFile)."' doesn't contain ".$this->packageFileName." file.", "", $indent + 1);
            }
        }
        private function installModule($module, $set, $installInDir, $indent) {
            global $APP_ROOT;
            if($this->shouldContain($module, array("path"))) {
                $this->formatModule($module);
                if(isset($this->installedModules->{$module->path})) {
                    $this->log($module->name." module is skipped (it is already installed)", "", $indent + 2);
                    return;
                }
                if(!file_exists($installInDir."/".$module->name)) {
                    if(mkdir($installInDir."/".$module->name, 0777)) {
                        $this->log($module->name." directory created", "", $indent + 2);
                    } else {
                        $this->error($module->name." directory is no created", "", $indent + 2);
                    }
                }
                $tree = $this->readRepository($set);
                $found = false;
                if(isset($tree->tree)) {
                    foreach($tree->tree as $item) {
                        if(strpos($item->path, $module->path) === 0 && $item->path !== $module->path) {
                            $found = true;
                            if($item->type == "blob") {
                                $content = $this->request($this->gitEndPointRaw.$set->owner."/".$set->repository."/".$tree->sha."/".$item->path, false);
                                $path = str_replace($module->path."/", "", $item->path);
                                $fileToBeSaved = $installInDir."/".$module->name."/".$path;
                                if(file_put_contents($fileToBeSaved, $content) !== false) {
                                    $this->log($item->path." file added", "", $indent + 2);
                                } else {
                                    $this->error($item->path." file is not added", "", $indent + 2);
                                }
                            } else if($item->type == "tree") {
                                $path = str_replace($module->path."/", "", $item->path);
                                $directoryToBeCreated = $installInDir."/".$module->name."/".$path;
                                if(!file_exists($directoryToBeCreated)) {
                                    if(mkdir($directoryToBeCreated, 0777)) {
                                        $this->log($path." directory created", "", $indent + 2);
                                    } else {
                                        $this->error($path." directory is no created", "", $indent + 2);
                                    }
                                }
                            }
                        }
                    }
                }
                if(!$found) {
                    $this->error("'".$module->path."' was not found in repository '".$set->owner."/".$set->repository."' (branch: '".$set->branch."')", $indent + 2);
                    rmdir($installInDir."/".$module->name);
                } else {
                    if(isset($tree->sha)) {
                        $fileToBeSaved = $installInDir."/".$module->name."/commit.sha";
                        if(file_put_contents($fileToBeSaved, $tree->sha) !== false) {
                            $this->log($module->name."/commit.sha file added (".$tree->sha.")", "", $indent + 2);
                        } else {
                            $this->error($module->name."/commit.sha file is node added", "", $indent + 2);
                        }
                        $this->installedModules->{$module->path} = true;
                        if(file_exists($installInDir."/".$module->name."/package.json")) {
                            $this->installModules($installInDir."/".$module->name."/package.json", $indent + 2);
                        }
                    }
                }
            }
        }
        private function readRepository(&$set) {
            $repoPath = $set->owner."/".$set->repository."/branches/".$set->branch;
            if(isset($this->gitRepos->{$repoPath})) {
                return $this->gitRepos->{$repoPath};
            }
            if(!isset($set->commit)) {
                $masterBranchURL = $this->gitEndPoint."repos/".$set->owner."/".$set->repository."/branches/".$set->branch;
                $masterBranch = $this->request($masterBranchURL);
                $set->commit = $masterBranch->commit->sha;
            }
            $treeURL = $this->gitEndPoint."repos/".$set->owner."/".$set->repository."/git/trees/".$set->commit."?recursive=1";
            $tree = $this->request($treeURL);
            $this->gitRepos->{$repoPath} = $tree;
            return $tree;
        }

        // formatting
        private function formatModule(&$module) {
            $module->path = substr($module->path, strlen($module->path)-1, 1) == "/" ? substr($module->path, 0, strlen($module->path)-1) : $module->path;
            if(!isset($module->name)) {
                $pathParts = explode("/", $module->path);
                $module->name = $pathParts[count($pathParts)-1];
            }
        }

        // requesting
        private function request($url, $json = true) {
            $ch = curl_init();
            curl_setopt($ch,CURLOPT_URL,$url);
            curl_setopt($ch,CURLOPT_RETURNTRANSFER,1); 
            curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,0);
            $content = curl_exec($ch);
            curl_close($ch);
            if($json) {
                return json_decode($content);
            } else {
                return $content;
            }
        }

        // validation
        private function shouldContain($ob, $properties, $message = "Missing property '{prop}'!") {
            foreach($properties as $prop) {
                if(!isset($ob->{$prop})) {
                    $this->error(str_replace("{prop}", $prop, $message));
                    return false;
                }
            }
            return true;
        }
        private function shouldBeNonEmptyArray($arr) {
            return is_array($arr) && count($arr) > 0;
        }

        // output
        private function error($str, $indent = 0) {
            $this->log("Error: ".$str, "RED", $indent);
        }
        private function warning($str) {
            $this->log("Warning: ".$str);
        }
        private function log($str, $color = "", $indent = 0) {
            $colors = array(
                "BLACK" => "\033[00;30m",
                "RED" => "\033[00;31m",
                "GREEN" => "\033[00;32m",
                "YELLOW" => "\033[00;33m",
                "BLUE" => "\033[00;34m",
                "MAGENTA" => "\033[00;35m",
                "CYAN" => "\033[00;36m",
                "WHITE" => "\033[00;37m",
                "" => ""
            );
            $indentStr = "";
            for($i=0; $i<$indent; $i++) {
                $indentStr .= "   ";
            }
            echo $colors[$color].$indentStr."> ".$str."\033[39m\n";
        }

    }

?>