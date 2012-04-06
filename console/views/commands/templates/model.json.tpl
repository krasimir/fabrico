{
    "adapter": "<path to adapter>",
    "freeze": <boolean>,
    "pageTitle": "<string>",
    "title": "<string>",
    "fields": [
        <Field>,
        <Field>,
        <Field>,
        ...
    ],
    "actions": {
        "listing": {
            "controller": "<path to controller>",
            "fieldsToHide": [
                "<name of field>"
            ],
            "positionEditing": "<direct|up-down>"
        },
        "adding": {
            "controller": "<path to controller>"
        },
        "editing": {
            "controller": "<path to controller>"
        },
        "deleting": {
            "controller": "<path to controller>"
        }
    }
}