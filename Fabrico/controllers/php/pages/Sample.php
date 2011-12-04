<?php

    require_once("pages/Page.php");

    class Sample extends Page {
    
        public function __construct() {
            parent::__construct(array(
                "url" => "/sample", // required
                "table" => "fabrico_sample", // required
                "defaultController" => "actions/Listing.php",
                "fieldsMap" => array(
                    "name_Text" => "Name",
                    "picture_File_SampleConfig" => "File",
                    "description_TextLong" => "Description",
                    "pictures_Files_SampleConfig2" => "Files",
                    "category_Select_SampleConfig3" => "Category",
                    "category_SelectRadio_SampleConfig3" => "Question",
                    "category_SelectCheck_SampleConfig3" => "Question",
                    "category_SelectDb_SampleConfig4" => "Category",
                    "content_TextRich" => "Content"
                ),
                "routes" => array(
                    "/sample/show-sample-static-page" => "pages/SampleStatic.php"
                ),
                "title" => "fabrico / Sample"
            ));
        }
        // It is important to override this method. Adminer uses this string while picking the views' templates
        public function __toString() {
            return "Sample";
        }
        // Normally you don't need to override this method. It is done here only to show you that you can use events->saved to do something after the saving
        public function run($req, $res) {
            
            // forward the user to the controller's home page
            /*$controller = $this;
            $this->router->{"/sample/editing/@id"}->events->saved->add(function() use ($controller, $req, $res) {
                header("Location: ".$req->fabrico->root->http.$controller->url);
            });*/
            
            parent::run($req, $res);
        }
    }

?>