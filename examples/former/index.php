<link rel="stylesheet" type="text/css" href="../../src/core/Former/css/styles.css" />
<script src="../../src/core/Former/plugins/tinymce/tiny_mce.js" type="text/javascript"></script>
<script src="../../src/core/Former/plugins/datepicker/datepicker.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="../../src/core/Former/plugins/datepicker/datepicker.css" />
<div style="width: 400px;">
<?php

    require("../../src/core/Former/index.php");

    // setting templates path
    // Former::templatesPath(__DIR__."/");

    // setting custom error message
    FormerValidation::$MESSAGE_NotEmpty = "Don't leave this field empty!";

    // registering the form
    $form = Former::register("register-user", "/examples/former/");
    $form
    ->addTextBox(array(
        "name" => "username", 
        "label" => "Your name:", 
        "validation" => Former::validation()->NotEmpty()->LengthMoreThen(5)->String()
    ))
    ->addTextArea(array(
        "name" => "description", 
        "label" => "Few words about you:"
    ))
    ->addPasswordBox(array(
        "name" => "password", 
        "label" => "Your password:", 
        "validation" => Former::validation()->NotEmpty()->LengthMoreThen(5)
    ))
    ->addTextBox(array(
        "name" => "salary", 
        "label" => "Your prefered salary:", 
        "validation" => Former::validation()->NotEmpty()->LengthMoreThen(3)->Int()->LessThen(1450)
    ))
    ->addDropDown(array(
        "name" => "city",
        "label" => "Your city:",
        "options" => array(
            "none" => "None",
            "new-york" => "New York",
            "london" => "London",
            "paris" => "Paris"
        )
    ))
    ->addRadio(array(
        "name" => "job",
        "label" => "Your job:",
        "options" => array(
            "none" => "None",
            "front-end" => "Front-end developer",
            "back-end" => "Back-end developer"
        ),
        "validation" => Former::validation()->Not("none")
    ))
    ->addCheck(array(
        "name" => "special-wishes",
        "label" => "Special wishes:",
        "options" => array(
            "w1" => "fresh water",
            "w2" => "fruits",
            "w3" => "dentist"
        )
    ))
    ->addFile(array(
        "name" => "avatar",
        "label" => "Please choose your avatar:"
    ))
    ->addTinyEditor(array(
        "name" => "richtext",
        "label" => "Add more information about you:", 
        "validation" => Former::validation()->NotEmpty()
    ))
    ->addDatePicker(array(
        "name" => "date",
        "label" => "The date:",
        "validation" => Former::validation()->NotEmpty()->custom(function($value) {
            $maxDate = mktime(0, 0, 0, 2, 1, 2013);
            $value = explode("/", $value);
            $setDate = mktime(0, 0, 0, $value[1], $value[0], $value[2]);
            if($maxDate < $setDate) {
                return (object) array("status" => false, "message" => "The date should be less then 01 February 2013.");
            } else {
                return (object) array("status" => true, "message" => "");
            }
        })
    ));

    // then, in your controller
    $loginForm = Former::get("register-user", $_POST, (object) array("description" => "...", "job" => "front-end"));
    if($loginForm->submitted && $loginForm->success) {
        // Form is submitted
        $data = $loginForm->data;
        var_dump($data);
    } else {
        // The form is still not submitted or it doesn't pass the validations
        $markup = $loginForm->markup;
        echo $markup;
    }

?>
</div>