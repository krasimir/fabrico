<?php

    class Presenter {
    
        private $responseValue = "...";
        private $responseFailedValidator;
        
        public function __construct($properties = array()) {
            foreach($properties as $prop => $value) {
                $this->$prop = $value;
            }
        }
        public function __toString() {
            return "Presenter";
        }
        public function __set($key, $value) {
            switch($key) {
                case "response":
                    // setting the response
                    $this->responseValue = $value;
                    // validation
                    if(isset($this->validators)) {
                        if(!is_array($this->validators)) {
                            $this->validators = array($this->validators);
                        }
                        $valid = true;
                        $this->responseFailedValidator = null;
                        foreach($this->validators as $validator) {
                            if($valid) {
                                if(!isset($validator->class)) {
                                    throw new Exception($this." missing ->class property of validator for field '".$this->name."'");
                                } else {
                                    $className = inject($validator->class);
                                    $validatorInstance = new $className($this);
                                    $method = isset($validator->method) ? $validator->method : "run";
                                    if(!$validatorInstance->$method($value, isset($validator->parameters) ? $validator->parameters : null)) {
                                        $valid = false;
                                        $this->responseFailedValidator = (object) array(
                                            "validator" => $validatorInstance,
                                            "message" => isset($validator->message) ? $validator->message : "Wrong input."
                                        );
                                    }
                                }
                            }
                        }
                    }
                break;
                default:
                    $this->$key = $value;
                break;
            }
        }
        public function __get($key) {
            switch($key) {
                case "response":
                    return (object) array(
                        "value" => $this->responseValue,
                        "valid" => isset($this->validators) ? $this->responseFailedValidator === null : true,
                        "validator" => $this->responseFailedValidator !== null ? $this->responseFailedValidator->validator : null,
                        "message" => $this->responseFailedValidator !== null ? $this->responseFailedValidator->message : null
                    );
                break;
            }
        }
        public function listing($value) {
            $this->response = $value;
            return $this;
        }
        public function add($default = null) {
            $this->response = $value;
            return $this;
        }
        public function addAction() {
            $this->response = $value;
            return $this;
        }
        public function edit($value) {
            $this->response = $value;
            return $this;
        }
        public function editAction($value) {
            $this->response = $value;
            return $this;
        }
        public function deleteAction($value) {
            $this->response = $value;
            return $this;
        }
        public function view($template, $data) {
            $searchIn = array();
            $searchIn []= $this->model->name."/".$this->name;
            $searchIn []= $this->controller."/".$this->model->name."/".$this->name;
            $searchIn []= $this->controller."/".$this."/".$this->name;
            $searchIn []= $this->controller."/".$this;
            $searchIn []= ViewConfig::$searchIn[count(ViewConfig::$searchIn)-1]."/".$this;
            return view($template, $data, $searchIn);
        }        
    }
    
    class PresenterFactory {
    
        private static $enableDebug = false;
        
        public static function get($field, $properties = array()) {
        
            $parts = explode("/", $field->presenter);
            $presenterName = str_replace(".php", "", array_pop($parts));
            
            foreach($properties as $key => $value) {
                $field->$key = $value;
            }
            
            inject($field->presenter);
            $presenter = new $presenterName($field);
            
            if(self::$enableDebug) {
                var_dump("presenter: ".$field->presenter);
            }
            
            return $presenter;
        }
        public static function debug($value) {
            self::$enableDebug = $value;
        }
    
    }

?>