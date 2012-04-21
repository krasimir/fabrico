{
    "name": "<name of the field>",
    "presenter": "presenters/TextTinyMCE.php",
    "config": {
        "mode" : "textareas",
        "theme" : "<"simple" or "advanced">",
        "theme_advanced_buttons1": "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,formatselect",
        "theme_advanced_buttons2": "cut,copy,paste,pastetext,pasteword,|,bullist,numlist,|,outdent,indent,blockquote",
        "theme_advanced_buttons3": "search,replace",
        "theme_advanced_buttons4": ""
        ...
    },
    "label": "<label of the field>",
    "description": "<description of the field>",
    "defaultValue": "<default value>",
    "dependencies": [ 
        <Dependency>, 
        <Dependency>, 
        <Dependency>, 
        ...
    ],
    "validators": [
        <Validator>, 
        <Validator>,
        <Validator>,
        ...
    ]
}