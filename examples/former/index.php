<link rel="stylesheet" type="text/css" href="../../src/core/Former/css/styles.css" />
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
    ));

    // then in your controller
    $loginForm = Former::get("register-user", array("description" => "...", "job" => "front-end"));
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