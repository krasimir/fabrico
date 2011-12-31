<?php

    inject("validators/ValidatorFactory.php");

    /**
    The presenter is responsible for the database field's operations. I.e. showing, adding, editing and deleting.
    * @package Fabrico\Modules\Presenters
    */
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
                                $validatorResponse = ValidatorFactory::get($validator, $value);
                                if($validatorResponse->validator !== null) {
                                    $valid = false;
                                    $this->responseFailedValidator = $validatorResponse;
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
                        "validator" => $this->responseFailedValidator !== null ? $this->responseFailedValidator->validator :  null,
                        "message" => $this->responseFailedValidator !== null ? $this->responseFailedValidator->message :  null
                    );
                break;
            }
        }
        /**
        After the call of this method $presenter->response->value will contain html formated code. A visual presentation of value.
        @param $value The current value from the database.
        */
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

?>