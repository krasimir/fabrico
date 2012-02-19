<?php

    inject("validators/ValidatorFactory.php");

    /**
    The presenter is responsible for the database field's operations. I.e. showing, adding, editing and deleting.
    * @package Fabrico\Library\Presenters
    */
    class Presenter {
    
        public $validators;
        public $response;
        public $model;
        public $controller;
        public $name;
    
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
        /**
        After the call of this method $presenter->response->value will contain html formated code. A visual presentation of value.
        @param $value The current value from the database.
        */
        public function listing($value) {
            $this->setResponse($value);
            return $this;
        }
        public function add($default = null) {
            $this->setResponse($default);
            return $this;
        }
        public function addAction() {
            $this->setResponse($value);
            return $this;
        }
        public function edit($value) {
            $this->setResponse($value);
            return $this;
        }
        public function editAction($value) {
            $this->setResponse($value);
            return $this;
        }
        public function deleteAction($value) {
            $this->setResponse($value);
            return $this;
        }
        public function view($template, $data) {
            $searchIn = array();
            $searchIn []= "/views/".$this->model->name."/".$this->name;
            $searchIn []= "/views/".$this->controller."/".$this->model->name."/".$this->name;
            $searchIn []= "/views/".$this->controller."/".$this."/".$this->name;
            $searchIn []= "/views/".$this->controller."/".$this;
            $searchIn []= ViewConfig::$searchIn[count(ViewConfig::$searchIn)-1]."/".$this;
            return view($template, $data, $searchIn);
        }       
        protected function setResponse($value) {
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
            // composing response
            $this->response = (object) array(
                "value" => $this->responseValue,
                "valid" => isset($this->validators) ? $this->responseFailedValidator === null : true,
                "validator" => $this->responseFailedValidator !== null ? $this->responseFailedValidator->validator :  null,
                "message" => $this->responseFailedValidator !== null ? $this->responseFailedValidator->message :  null
            );
        }
    }

?>