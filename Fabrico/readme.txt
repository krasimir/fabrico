
/**********************************************************************************************/
/**********************************************************************************************/
/******                                                                                  ******/
/******                               adminer flow                                       ******/
/******                                                                                  ******/
/**********************************************************************************************/
/**********************************************************************************************/

1. /index.php 
2. /controllers/php/Routes.php (a route to the adminer is added)
   $router->all("/admin(.*)?", "modules/php/adminer/Adminer.php");
3. /modules/php/adminer/Adminer.php (entry point of the adminer)
4. Adminer is also a middleware
    4.1. config => /modules/php/adminer/modules/php/AdminerConfig.php (adminer configuration is loaded)
    4.2. debug => /modules/php/adminer/modules/php/AdminerDebug.php (put the adminer in a debug mode)
    4.3. assets => /expressphp/middleware/AssetsManager.php (manager js and css of the adminer)
    4.4. access => /modules/php/adminer/modules/php/AdminerAccess.php (takes care for the adminer's login process)
    4.5. router => /expressphp/middleware/Router.php (routing of the adminer.)
5. Adminer checks its routes in /modules/php/adminer/controllers/php/AdminerRoutes.php
    5.1. A route for your custom controller should be added in /modules/php/adminer/controllers/php/AdminerRoutes.php. Example:
         $router->all("/admin/sample(.*)?", "modules/php/adminer/controllers/php/Sample.php");
    5.2. Your custom controller
        a) should extend /modules/php/adminer/controllers/php/AdminerController.php (which is also a middleware with router) if you are going to administrate database's table. To the parent constructor you should pass an array with the following properties:
            - "url" => "/admin/sample/" - required
            - "table" => "buildit_sample" - required
            - "defaultRoute" => "listing" - there are several routes added by default - Adding, Listing, Editing, Deleting and Ordering
            - "fieldsMap" => array("name_Text" => "Name") - translation of the table column names
            - "routes" => array("show-sample-static-page" => "modules/php/adminer/controllers/php/SampleStaticPage.php") - adding custom routes or overrideing the existing once
        b) should have run($req, $res) method
        c) shoud override the default __toString method
    5.3. The controllers for the routs of your custom class are called "actions". I.e. Adding, Listing, Editing etc ... are actions and are put in /modules/php/adminer/controllers/php/actions
    5.4. Every action knows the name of the columns of the database's table. Based on that it creates objects called "workers" and calls one of the following methods
        a) listing - when the database field should be displayed by the Listing action
        b) add - it returns a form element for adding a new record in the database
        c) addAction - it returns string/value which will be added in the database
        d) edit - same as add, but for editing
        e) editAction - same as addAction, but for editing
        f) delete - called when a record is deleted
            * the workers are stored in /modules/php/adminer/modules/php/workers
            
/**********************************************************************************************/
/**********************************************************************************************/
/******                                                                                  ******/
/******                               templating                                         ******/
/******                                                                                  ******/
/**********************************************************************************************/
/**********************************************************************************************/

- The templates of the adminer are stored in /modules/php/adminer/views
- The default templates are in /modules/php/adminer/views/Base
- If you need to change something just create a new directory with name matching the name of your controller. For example, if you have a controller called ProductManager, you shold create /modules/php/adminer/views/ProductManager. There, you can create /modules/php/adminer/views/ProductManager/mainnav.html to override the main navigation of the adminer. IMPORTANT! Don't forget to override the __toString method in your controller. The adminer uses this function while searches for templates.
- The actions also have templates and generally they are placed in /modules/php/adminer/views/Base/[Name of the action]. You can again override them by creating /modules/php/adminer/views/[Name of your controller]/[Name of the action].
- The workers also have templates and generally they are placed in /modules/php/adminer/views/Base/[Name of the worker]. You can again override them by creating /modules/php/adminer/views/[Name of your controller]/[Name of the worker]. You can even create a template for a specific field in the database. It should be stored in /modules/php/adminer/views/[Name of your controller]/[Name of the worker]/[name of the table's field]


/**********************************************************************************************/
/**********************************************************************************************/
/******                                                                                  ******/
/******                               resources                                          ******/
/******                                                                                  ******/
/**********************************************************************************************/
/**********************************************************************************************/

Icons: http://icondock.com/free/mini-pixel-icons