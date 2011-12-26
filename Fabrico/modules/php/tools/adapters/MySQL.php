<?php

    /**
    * @package Fabrico\Modules\Tools\Adapters
    */
    class MySQL {
        
        public $debug = false;
        
        private $configs;
        private $initialized = false;
        private $queries = array();
        private $tableName = "";
        private $query;
        
        public function __construct($configs) {
            $this->configs = $configs;
            $this->query = (object) array();
        }
        public function __toString() {
            return "MySQL";
        }
        public function __get($key) {
            if(isset($this->$key)) {
                return $this->$key;
            } else if(isset($this->configs->$key)) {
                return $this->configs->$key;
            } else {
               return null; 
            }
        }
        public function get() {
            $this->query->select = "SELECT * FROM {tableName}";
            return $this;
        }
        public function store($record) {
        
            if($record) {
        
                // updating
                if(isset($record->id) && $record->id) {
                    $this->query->update = "UPDATE {tableName} SET ";
                    foreach($record as $key => $value) {
                        if($key != "id") {
                            $this->query->update .= $key."='".$value."', ";
                        }
                    }
                    $this->query->update = substr($this->query->update, 0, strlen($this->query->update)-2);
                    $this->where("id='".$record->id."'");
                    $this->flush();
                    return $record->id;
                    
                // inserting
                } else {
                    $record->position = $this->getNextPosition();
                    $this->query->insert = "INSERT INTO {tableName} (";
                    $fields = "";
                    $values = "";
                    foreach($record as $key => $value) {
                        $fields .= $key.", ";
                        $values .= "'".$value."', ";
                    }
                    $fields = substr($fields, 0, strlen($fields)-2);
                    $values = substr($values, 0, strlen($values)-2);
                    $this->query->insert .= $fields.") VALUES (".$values.")";
                    $this->flush();
                    $res = $this->action("SELECT max(id) as value FROM {tableName}");
                    return $res[0]->value;
                }
            
            }
            
            return FALSE;
        }
        public function trash($record) {
            $this->query->delete = "DELETE FROM {tableName}";
            $this->where("id='".$record->id."'");
            $this->flush();
            return $record->id;
        }
        public function order($str) {
            $this->query->order = " ORDER BY ".$str;
            return $this;
        }
        public function asc() {
            $this->query->asc = " ASC";
            return $this;
        }
        public function desc() {
            $this->query->desc = " DESC";
            return $this;
        }
        public function where($str) {
            if(isset($this->query->where)) {
                $this->query->where .= $str;
            } else {
                $this->query->where = $str;
            }
            return $this;
        }
        public function report() {
            var_dump($this."");
            var_dump($this->queries);
            return $this;
        }
        public function flush() {
            $result = $this->action();
            $this->query = (object) array();
            return $result;
        }
        public function action($queryStr = FALSE) {
            $this->initialize();
            if($queryStr === FALSE) {
                $queryStr = $this->composeQueryStr();
            }
            $queryStr = str_replace("{tableName}", $this->tableName, $queryStr);
            $this->queries []= $queryStr;
            $res = mysql_query($queryStr);
            if(is_resource($res)) {
                if(mysql_num_rows($res) === 0) {
                    return mysql_fetch_object($res);
                } else {
                    $rows = array();
                    while($row = mysql_fetch_object($res)) {
                        $rows []= $row;
                    }
                    return $rows;
                }
            }
            return $res;
        }
        private function initialize() {
        
            if($this->initialized) { return true; };
            $this->initialized = true;
            
            // checks
            if($this->host === null) {
                $this->error("missing property 'host' in '".$this."' (check /config/config.json:adapters)");
            }
            if($this->dbname === null) {
                $this->error("missing property 'dbname' in '".$this."' (check /config/config.json:adapters)");
            }
            if($this->user === null) {
                $this->error("missing property 'user' in '".$this."' (check /config/config.json:adapters)");
            }
            if($this->pass === null) {
                $this->error("missing property 'pass' in '".$this."' (check /config/config.json:adapters)");
            }
            
            // connecting and select db
            $res = @mysql_connect($this->host, $this->user, $this->pass);       
            if($res === FALSE) {
                $this->error("can't connect (check /config/config.json:adapters.".$this.")");
            } else {
                $res = @mysql_select_db($this->dbname, $res);
                if($res === FALSE) {
                    $this->error("can't select database (check /config/config.json:adapters.".$this.")");
                }
            }
            
            // setting the table's name
            $this->tableName = strtolower($this->name);
            
            if(!isset($this->freeze) || !$this->freeze) {
            
                // checking/creating the table
                $res = $this->action("SHOW TABLES LIKE '".$this->tableName."'");
                if($res === FALSE) {
                    $res = $this->action("
                        CREATE TABLE IF NOT EXISTS `".$this->tableName."` (
                            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                            `position` bigint(20) unsigned NOT NULL,
                            PRIMARY KEY (`ID`)
                        ) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;
                    ");
                }
            
                if($this->fields !== null) {
               
                    // add columns to the table
                    $tableFields = $this->action("SHOW COLUMNS FROM ".$this->tableName);
                    foreach($this->fields as $field) {
                        $add = true;
                        foreach($tableFields as $tableField) {
                            if($field->name == $tableField->Field) {
                                $add = false;
                            }
                        }
                        if($add) {
                            $this->action("ALTER TABLE ".$this->tableName." ADD ".$field->name.$this->getMySQLColumnType($field));
                        }
                    }
                    
                    // removing columns from the table
                    foreach($tableFields as $tableField) {
                        $remove = true;
                        foreach($this->fields as $field) {
                            if($tableField->Field == $field->name) {
                                $remove = false;
                            }
                        }
                        if($remove && $tableField->Field != "id" && $tableField->Field != "position") {
                            $this->action("ALTER TABLE ".$this->tableName." DROP COLUMN ".$tableField->Field);
                        }
                    }
                
                }
                
            }
                
        }
        private function composeQueryStr() {
            $str = "";
            if(isset($this->query->select)) {
                $str .= $this->query->select;
                $str .= isset($this->query->where) ? " WHERE ".$this->query->where : "";
                $str .= isset($this->query->order) ? $this->query->order : "";
                $str .= isset($this->query->asc) ? $this->query->asc : "";
                $str .= isset($this->query->desc) ? $this->query->desc : "";
            } else if(isset($this->query->insert)) {
                $str = $this->query->insert;
            } else if(isset($this->query->delete)) {
                $str = $this->query->delete;
                $str .= isset($this->query->where) ? " WHERE ".$this->query->where : "";
            } else if(isset($this->query->update)) {
                $str = $this->query->update;
                $str .= isset($this->query->where) ? " WHERE ".$this->query->where : "";
            }
            return $str;
        }
        private function getNextPosition() {
            $res = $this->action("SELECT max(position) as value FROM {tableName}");
            return isset($res[0]) ? $res[0]->value + 1 : 1;
        }
        private function getMySQLColumnType($field) {
            $parts = explode("/", $field->presenter);
            $presenterName = str_replace(".php", "", array_pop($parts));
            $str = "";
            switch($presenterName) {
                case "Text": $str .= " VARCHAR(100) "; break;
                case "Digit": $str .= " INT(10) "; break;
                case "Color": $str .= " VARCHAR(10) "; break;
                case "Date":
                    if(isset($field->config)) {
                        if($field->config->showsTime) {
                            return " DATETIME ";
                        } else {
                            return " DATE ";
                        }
                    } else {
                        return " DATE ";
                    }
                break;
                case "File": $str .= " LONGTEXT "; break;
                case "Files": $str .= " LONGTEXT "; break;
                case "Select": $str .= " LONGTEXT "; break;
                case "SelectCheck": $str .= " LONGTEXT "; break;
                case "SelectDb": $str .= " LONGTEXT "; break;
                case "SelectRadio": $str .= " LONGTEXT "; break;
                case "TextLong": $str .= " LONGTEXT "; break;
                case "TextRich": $str .= " LONGTEXT "; break;
                default: $str .= " VARCHAR(100) "; break;
            }
            if(isset($field->default)) {
                $str .= " NOT NULL DEFAULT '".$field->default."' ";
            }
            return $str;
            // ALTER TABLE  `sample` ADD  `gsd` INT( 10 ) NOT NULL AFTER  `price`
        }
        private function error($str) {
            throw new Exception($this.": ".$str);
        }
    
    }
    
    /**
    * @package Fabrico\Modules\Tools\Adapters
    */
    class MySQLConfig {
    
        public $name = null;
        public $host = "";
        public $user = "";
        public $pass = "";
        public $dbname = "";
        public $freeze = false;
        public $fields = null;
        public $debug = false;
        
        public function __construct($props = null) {
            if($props != null) {
                foreach($props as $key => $value) {
                    $this->$key = $value;
                }
            }
        }
        
    }

?>