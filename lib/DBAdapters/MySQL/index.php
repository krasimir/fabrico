<?php

    class MySQLAdapter {
        
        public $debug = false;
        public $freeze = false;
        public $queries = array();

        private $host;
        private $user;
        private $pass;
        private $dbname;
        private $dbh;

        private $currentContext;
        private $query;
        private $cache;
        private $contexts;
        private $record;

        private $validDataTypes = array("INT", "VARCHAR", "TEXT", "DATE", "TINYINT", "SMALLINT", "MEDIUMINT", "INT", "BIGINT", "DECIMAL", "FLOAT", "DOUBLE", "REAL", "BIT", "BOOLEAN", "SERIAL", "DATE", "DATETIME", "TIMESTAMP", "TIME", "YEAR", "CHAR", "TINYTEXT", "TEXT", "MEDIUMTEXT", "LONGTEXT", "BINARY", "VARBINARY", "TINYBLOB", "MEDIUMBLOB", "BLOB", "LONGBLOB", "ENUM");
        
        public function __construct($config) {
            foreach ($config as $key => $value) {
                $this->$key = $value;
            }
            $this->query = (object) array();
            $this->contexts = (object) array();
            $this->cache = array();
        }
        public function __toString() {
            return "MySQLAdapter";
        }
        public function __get($prop) {
            if(isset($this->contexts->$prop)) {
                return $this->context($prop);
            }
            return $this;
        }
        public function defineContext($name, $schema) {
            $this->contexts->$name = $schema;
            return $this;
        }
        public function context($name) {
            $this->currentContext = $name;
            return $this;
        }
        public function save($record) {
        
            if($record) {

                $this->record = $record;
        
                // updating
                if(isset($record->id) && $record->id) {
                    $this->query->update = "UPDATE {currentContext} SET ";
                    foreach($record as $key => $value) {
                        if($key != "id") {
                            $this->query->update .= $key."='".$value."', ";
                        }
                    }
                    $this->query->update = substr($this->query->update, 0, strlen($this->query->update)-2);
                    $this->where("id='".$record->id."'");
                    $this->flush(false);
                    return $record->id;
                    
                // inserting
                } else {
                    $record->position = $this->getNextPosition();
                    $this->query->insert = "INSERT INTO {currentContext} (";
                    $fields = "";
                    $values = "";
                    foreach($record as $key => $value) {
                        $fields .= $key.", ";
                        $values .= "'".$value."', ";
                    }
                    $fields = substr($fields, 0, strlen($fields)-2);
                    $values = substr($values, 0, strlen($values)-2);
                    $this->query->insert .= $fields.") VALUES (".$values.")";
                    $this->flush(false);
                    $res = $this->action("SELECT max(id) as value FROM {currentContext}", false);
                    return $record->id = $res[0]->value;
                }
            
            }
            
            return FALSE;
        }
        public function trash($record) {
            $this->query->delete = "DELETE FROM {currentContext}";
            $this->where("id='".$record->id."'");
            $this->flush();
            return $record->id;
        }
        public function get() {
            $this->query->select = "SELECT * FROM {currentContext}";
            return $this->flush();
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
        public function limit($str) {
            $this->query->limit = " LIMIT ".$str;
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
        public function flush($useCache = true) {
            $result = $this->action(false, $useCache);
            $this->query = (object) array();
            return $result;
        }
        public function action($queryStr = false, $useCache = true) {

            $this->checkServerSettings();
            if($queryStr === false) {
                $this->checkContext();
                $this->checkContextSchema();
                $queryStr = $this->composeQueryStr();
            }

            $queryStr = str_replace("{currentContext}", $this->currentContext, $queryStr);            
            if($useCache && isset($this->cache[$queryStr])) {
                $this->queries []= $queryStr." (cached)";
                return $this->cache[$queryStr];
            } else {
                try {
                    $pdos = $this->dbh->prepare($queryStr);
                    $pdos->execute();
                    $res = $pdos->fetchAll(PDO::FETCH_CLASS);
                    $this->queries []= $queryStr;
                    $this->cache[$queryStr] = $res;
                    return $res;
                } catch(PDOException $e) {
                    $this->error($e->getMessage());
                }
            }
        }
        private function checkServerSettings() {
            // checks
            if($this->host === null) {
                $this->error("missing property 'host' in '".$this);
            }
            if($this->dbname === null) {
                $this->error("missing property 'dbname' in '".$this);
            }
            if($this->user === null) {
                $this->error("missing property 'user' in '".$this);
            }
            if($this->pass === null) {
                $this->error("missing property 'pass' in '".$this);
            }
            
            try {                  
                $this->dbh = new PDO("mysql:host=".$this->host.";dbname=".$this->dbname, $this->user, $this->pass);
                $this->dbh->exec(mysql_query('SET NAMES utf8'));
            } catch(PDOException $e) {
                $this->error($e->getMessage());
            }
        }
        private function checkContext() {
            if($this->freeze) return;
            if($this->currentContext === null || $this->currentContext === "") {
                $this->error("Missing context!");
            }
            // checking/creating the table
            $queryStr = "SHOW TABLES LIKE '".$this->currentContext."'";
            if(!isset($this->cache[$queryStr])) {
                $this->queries []= $queryStr;
                $pdos = $this->dbh->query($queryStr);
                $res = $this->cache[$queryStr] = $pdos->fetchAll();
                if(count($res) === 0) {
                    $queryStr = "
                        CREATE TABLE IF NOT EXISTS `".$this->currentContext."` (
                            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                            `position` bigint(20) unsigned NOT NULL,
                            PRIMARY KEY (`ID`)
                        ) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;
                    ";
                    $this->queries []= $queryStr;
                    $r = $this->dbh->exec($queryStr);
                }
            }
        }
        private function checkContextSchema() {
            if($this->freeze) return;            
            if(isset($this->contexts->{$this->currentContext})) {
               
                try {
                    // add columns to the table
                    $pdos = $this->dbh->prepare("SHOW COLUMNS FROM ".$this->currentContext);
                    $pdos->execute();
                    $tableFields = $pdos->fetchAll();
                    $schema = $this->contexts->{$this->currentContext};
                    foreach($schema as $field => $value) {                    
                        $add = true;
                        if(count($tableFields) > 0) {
                            foreach($tableFields as $tableField) {
                                if($field == $tableField["Field"]) {
                                    $add = false;
                                }
                            }
                        }
                        if($add) {
                            $queryStr = "ALTER TABLE ".$this->currentContext." ADD ".$field." ".$value." ";
                            $this->queries []= $queryStr;
                            $res = $this->dbh->exec($queryStr);
                        }
                    }
                } catch(PDOException $e) {
                    $this->error($e->getMessage());
                }

            } else {
                $this->error("Missing schema for context ".$this->currentContext."! Please use defineContext method");
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
                $str .= isset($this->query->limit) ? $this->query->limit : "";
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
            $res = $this->action("SELECT max(position) as value FROM {currentContext}");
            return isset($res[0]) ? $res[0]->value + 1 : 1;
        }
        private function error($str) {
            throw new Exception($this.": ".$str);
        }
    
    }

?>
