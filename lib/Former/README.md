# Dealing with forms

A common case is that we have to show a html form, submit it and collect its data. Normally there are some validations and also usage of the same form for editing already stored data. There should be some nice way to deal with all those repeatable tasks and follow [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself) principle. Actually I didn't find any simple and elegant solution of the problem. So, this module is for that - simply dealing with forms.

- - -

## Usage

1. [Registering a new form](#1-registering-a-new-form).
2. [Adding controls](#2-adding-controls).
3. [Accessing the form](#3-accessing-the-form).
4. [Getting form's response](#4-getting-forms-response).
5. [Validation](#5-validation).
6. [Changing the action url](#6-changing-the-action-url).
7. [Custom html templates](#7-custom-html-templates).
8. [CSS styles](#8-css-styles).
9. [Changing the error messages](#9-changing-the-error-messages).

- - -

### 1. Registering a new form

    $form = Former::register([unique name], [action url], [request method, defaul to POST]);

examples:

    $form = Former::register("register-user", "/examples/former/", "GET");

### 2. Adding controls    
The next thing that you should do is to add controls to the form. I.e. the fields that you want to manage. The following methods are available:

    addTextBox
    addTextArea
    addPasswordBox
    addDropDown
    addRadio
    addCheck
    addFile
    addHiddenField
    addTinyEditor
    addDatePicker

Examples:

#### Text field

    $form->addTextBox(array(
        "name" => "username", 
        "label" => "Your name:"
    ));

#### Text area

    $form->addTextArea(array(
        "name" => "description", 
        "label" => "Few words about you:"
    ));

#### Password text box

    $form->addPasswordBox(array(
        "name" => "password", 
        "label" => "Your password:"
    ));

#### Drop-down menu

    $form->addDropDown(array(
        "name" => "city",
        "label" => "Your city:",
        "options" => array(
            "none" => "None",
            "new-york" => "New York",
            "london" => "London",
            "paris" => "Paris"
        )
    ));

#### Radio buttons

    $form->addRadio(array(
        "name" => "job",
        "label" => "Your job:",
        "options" => array(
            "none" => "None",
            "front-end" => "Front-end developer",
            "back-end" => "Back-end developer"
        )
    ));

#### Checkboxes

    $form->addCheck(array(
        "name" => "special-wishes",
        "label" => "Special wishes:",
        "options" => array(
            "w1" => "fresh water",
            "w2" => "fruits",
            "w3" => "dentist"
        )
    ));

#### File control

    $form->addFile(array(
        "name" => "avatar",
        "label" => "Please choose your avatar:"
    ));

#### Add hidden field

    $form->addHiddenField(array(
        "name" => "hiddenID"
    ));

#### Adding WYSIWYG editor
Former supports [TinyMCE](http://www.tinymce.com/). To use it you should include the following file into your page:

    <script src="[path to former]/plugins/tinymce/tiny_mce.js" type="text/javascript"></script>

Require the editor:
    
    $form->addTinyEditor(array(
        "name" => "richtext",
        "label" => "Add more information about you:"
    ));

#### Adding date picker
To use it you should include the following files into your page:

    <script src="[path to former]/plugins/datepicker/datepicker.js" type="text/javascript"></script>
    <link href="[path to former]/plugins/datepicker/datepicker.css" rel="stylesheet" type="text/css" />

Require the picker:

    ->addDatePicker(array(
        "name" => "date",
        "label" => "The date:"
    ));

The controls' methods return the same *form* object, so you can use the functional chain pattern:

    $form->addTextBox(array(
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
    ));

### 3. Accessing the form
There is no need to keep the reponse of *Former::register* and pass it around your application.

    $form = Former::get("unique-name-of-your-form");

### 4. Getting form's response
The response of the form could be html markup or the submitted data. Before to try to get some of these things you should populate the form by using the *update* method:

    $form->update([data source - associative array], [default values - an object]);

The data source could be $_POST, $_GET, $_FILES or something else. By default is $_POST. For example:

    $dataSource = array_merge($_POST, $_FILES);
    $form->update($dataSource);

The default values is an object like:
    
    $dataSource = array_merge($_POST, $_FILES);
    $defaultValues = (object) array("description" => "...", "cities" => array("c1", "c2"));
    $form = Former::get("register-user");
    $form->update($dataSource, $defaultValues);

Have in mind that the default value for checkboxes should be array.

Here is an example of how to process the form:

    if($form->submitted && $form->success) {
        // Form is submitted
        $data = $form->data;
        var_dump($data);
    } else {
        // The form is still not submitted or it doesn't pass the validations
        $markup = $form->markup;
        echo $markup;
    }

    

### 5. Validation
The data in every of the controls could be validated. Just pass *validation* property along with the others.

    $form->addTextBox(array(
        "name" => "username", 
        "label" => "Your name:", 
        "validation" => Former::validation()->NotEmpty()
    ))

Chaining several validators:

    $form->addTextBox(array(
        "name" => "username", 
        "label" => "Your name:", 
        "validation" => Former::validation()->NotEmpty()->LengthMoreThen(5)->String()
    ))

Available validators:

    ->NotEmpty()
    ->LengthMoreThen(5)
    ->LengthLessThen(5)
    ->ValidEmail()
    ->Match("/^([a-zA-Z0-9])+$/")
    ->Not()
    ->MoreThen(600)
    ->LessThen(100)
    ->Int()
    ->Float()
    ->String()
    ->custom()

The method *custom* accepts anonymous function, which you can use to implement a custom validation. However the response is strictly defined with properties *status* and *message*. For example:

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
    ))

### 6. Changing the action url

    $form = Former::get("register-user");
    $form->url("/new/url/here");

### 7. Custom html templates
If you need to change the html markup or just to add new logic copy the content of *tpl* directory in a new place. After that just set the new path like that:

    Former::templatesPath(__DIR__."/");

### 8. CSS styles
The generated markup require some CSS to look good. It is available in *css* directory.

### 9. Changing the error messages
The messages are available here:

    FormerValidation::$MESSAGE_NotEmpty = "Missing value.";
    FormerValidation::$MESSAGE_LengthMoreThen = "Wrong value length.";
    FormerValidation::$MESSAGE_LengthLessThen = "Wrong value length.";
    FormerValidation::$MESSAGE_Match = "Wrong value.";
    FormerValidation::$MESSAGE_Not = "Wrong value.";
    FormerValidation::$MESSAGE_ValidEmail = "Invalid email.";
    FormerValidation::$MESSAGE_MoreThen = "Wrong value.";
    FormerValidation::$MESSAGE_LessThen = "Wrong value.";
    FormerValidation::$MESSAGE_Int = "Wrong value.";
    FormerValidation::$MESSAGE_String = "Wrong value.";
    FormerValidation::$MESSAGE_Float = "Wrong value.";