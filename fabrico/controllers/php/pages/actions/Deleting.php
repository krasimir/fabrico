<?php
    
    inject(array(
        "presenters/Presenter.php",
        "actions/Action.php"
    ));

    /**
    * @package Fabrico\Controllers\Pages\Actions
    */
    class Deleting extends Action {
        
        public function __construct($router) {
            parent::__construct($router);
        }
        public function run($req, $res) {
            parent::run($req, $res);
            
            $id = $req->params["id"];
            if(isset($id)) {
                $fields = $this->model->fields;
                $record = $this->model->get()->where("id='".$id."'")->flush();
                if($record) {
                    $record = $record[0];
                    foreach($fields as $field) {
                        $presenter = $this->getPresenter($field);
                        $presenter->deleteAction($record->{$field->name});
                    }
                }
                $this->model->trash($record);
                $this->controller->events->ON_DELETE->dispatch((object) array("id" => $id));
                header("Location: ".$req->fabrico->paths->url.$this->controller->url);
            }
            
        }
    
    }

?>