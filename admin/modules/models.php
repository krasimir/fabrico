<?php

    function models() {
        return json_decode('
            {
                "type": "models",
                "adapters": "fabrico/adapters.php",
                "models": {
                    "sample": {
                        "adapter": "adapters/MySQL.php",
                        "freeze": false,
                        "pageTitle": "Sample administration",
                        "title": "Sample administration",
                        "fields": [
                            {
                                "name": "complexField",
                                "label": "My custom complex data",
                                "presenter": "presenters/ComplexData.php",
                                "config": {
                                    "elementsSeparator": "(!~~~^)",
                                    "elementsFieldsSeparator": "(@!!!%)",
                                    "fields": [
                                        {
                                            "name": "name",
                                            "label": "Name of the product"
                                        },
                                        {
                                            "name": "id",
                                            "label": "ID"
                                        },
                                        {
                                            "name": "price",
                                            "label": "Price of the product"
                                        }
                                    ]
                                }
                            },
                            {
                                "name": "filesApp",
                                "presenter": "presenters/Files.php",
                                "config": {
                                    "destination": "/assets/uploads"
                                }
                            },
                            {
                                "name": "avatar",
                                "presenter": "presenters/File.php",
                                "config": {
                                    "destination": "/assets/uploads"
                                }
                            },
                            {
                                "name": "category",
                                "presenter": "presenters/Select.php",
                                "config": {
                                    "options": [
                                        {"key": "yes", "label": "answer Yes"},
                                        {"key": "no", "label": "answer No"},
                                        {"key": "maybe", "label": "answer Maybe"}
                                    ]
                                }
                            },
                            {
                                "name": "types",
                                "presenter": "presenters/SelectDbCheck.php",
                                "defaultValue": "33",
                                "config": {
                                    "model": "types",
                                    "field": "name"
                                },
                                "validators": [
                                    {
                                        "class": "validators/NotEmpty.php"
                                    }
                                ],
                                "dependencies": [
                                    {
                                        "field": "category",
                                        "shouldMatch": "^no$"
                                    }
                                ]
                            }
                        ],
                        "actions": {
                            "listing": {
                                "controller": "actions/Listing.php",
                                "fieldsToHide": ["myName"],
                                "positionEditing": "direct"
                            },
                            "adding": {
                                "controller": "actions/Adding.php"
                            },
                            "editing": {
                                "controller": "actions/Editing.php"
                            },
                            "deleting": {
                                "controller": "actions/Deleting.php"
                            }
                        }
                    },
                    "types": {
                        "adapter": "adapters/MySQL.php",
                        "freeze": false,
                        "fields": [
                            {
                                "name": "name",
                                "label": "Name",
                                "presenter": "presenters/Text.php"
                            },
                            {
                                "name": "price",
                                "label": "Price",
                                "presenter": "presenters/Text.php"
                            },
                            {
                                "name": "currentUser",
                                "presenter": "presenters/HiddenCurrentUser.php",
                                "config": {
                                    "propertyForListingArea": "password"
                                }
                            },
                            {
                                "name": "modifiedDate",
                                "presenter": "presenters/HiddenModifiedDate.php"
                            }
                        ]
                    }
                }
            }
        ');
    }

?>
