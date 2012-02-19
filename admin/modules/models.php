<?php

    function getSampleFields() {
        return array(
            (object) array(
                "name" => "complexField",
                "label" => "My custom complex data",
                "presenter" => "presenters/ComplexData.php",
                "config" => (object) array(
                    "elementsSeparator" => "(!~~~^)",
                    "elementsFieldsSeparator" => "(@!!!%)",
                    "fields" => array(
                        (object) array(
                            "name" => "name",
                            "label" => "Name of the product"
                        ),
                        (object) array(
                            "name" => "id",
                            "label" => "ID"
                        ),
                        (object) array(
                            "name" => "price",
                            "label" => "Price of the product"
                        )
                    )
                )
            ),
            (object) array(
                "name" => "filesApp",
                "presenter" => "presenters/Files.php",
                "config" => (object) array(
                    "destination" => "/assets/uploads"
                )
            ),
            (object) array(
                "name" => "avatar",
                "presenter" => "presenters/File.php",
                "config" => (object) array(
                    "destination" => "/assets/uploads"
                )
            ),
            (object) array(
                "name" => "category",
                "presenter" => "presenters/Select.php",
                "config" => (object) array(
                    "options" => array(
                        (object) array("key" => "yes", "label" => "answer Yes"),
                        (object) array("key" => "no", "label" => "answer No"),
                        (object) array("key" => "maybe", "label" => "answer Maybe")
                    )
                )
            ),
            (object) array(
                "name" => "types",
                "presenter" => "presenters/SelectDbCheck.php",
                "defaultValue" => "33",
                "config" => (object) array(
                    "model" => "types",
                    "field" => "name"
                ),
                "validators" => array(
                    (object) array(
                        "class" => "validators/NotEmpty.php"
                    )
                ),
                "dependencies" => array(
                    (object) array(
                        "field" => "category",
                        "shouldMatch" => "^no$"
                    )
                )
            )
        );
    };

    function models() {
        return (object) array(
            "type" => "models",
            "adapters" => "fabrico/adapters.php",
            "models" => (object) array(
                "sample" => (object) array(
                    "adapter" => "adapters/MySQL.php",
                    "freeze" => false,
                    "pageTitle" => "Sample administration",
                    "title" => "Sample administration",
                    "fields" => getSampleFields(),
                    "actions" => (object) array(
                        "listing" => (object) array(
                            "controller" => "actions/Listing.php",
                            "fieldsToHide" => array("myName"),
                            "positionEditing" => "direct"
                        ),
                        "adding" => (object) array(
                            "controller" => "actions/Adding.php"
                        ),
                        "editing" => (object) array(
                            "controller" => "actions/Editing.php"
                        ),
                        "deleting" => (object) array(
                            "controller" => "actions/Deleting.php"
                        )
                    )
                ),
                "types" => (object) array(
                    "adapter" => "adapters/MySQL.php",
                    "freeze" => false,
                    "fields" => array(
                        (object) array(
                            "name" => "name",
                            "label" => "Name",
                            "presenter" => "presenters/Text.php"
                        ),
                        (object) array(
                            "name" => "price",
                            "label" => "Price",
                            "presenter" => "presenters/Text.php"
                        ),
                        (object) array(
                            "name" => "currentUser",
                            "presenter" => "presenters/HiddenCurrentUser.php",
                            "config" => (object) array(
                                "propertyForListingArea" => "password"
                            )
                        ),
                        (object) array(
                            "name" => "modifiedDate",
                            "presenter" => "presenters/HiddenModifiedDate.php"
                        )
                    )
                )
            )
        );
    }

?>
