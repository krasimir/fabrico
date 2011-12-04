<?php
/*
Code inspired from:

/**
 * Flight: An extensible micro-framework.
 *
 * @copyright   Copyright (c) 2011, Mike Cao <mike@mikecao.com>
 * @license     http://www.opensource.org/licenses/mit-license.php
 */


function shutdown() 
{ 
    $e=error_get_last(); 
    if($e != null) {
        ErrorHandler::$instance->error(new ErrorException($e['message'], 0, $e['type'], $e['file'], $e['line']) );
	}
} 

class ErrorHandler {

    static $instance;
    public $DEBUG = TRUE;
    public $onError = NULL;

    public function __construct(){
        static::$instance = $this;
		
        // Handle errors internally
        set_error_handler(array($this, 'handleError'));

        // Handle exceptions internally
        set_exception_handler(array($this, 'handleException'));

        register_shutdown_function('shutdown'); 

        error_reporting(E_ALL);
    }

    public function error(Exception $e) {
        // always output to log first
        $output = 'Message:'.$e->getMessage().'\n\r'.
                ' File:'.$e->getFile().' Line:'.$e->getLine().'\n\r'.
                ' Trace: '.$e->getTraceAsString();
        error_log($output);

        // show as raw response using Response.php style
        if($this->DEBUG == TRUE) {
            if($this->onError != NULL) {
                $handler = $this->onError;
                $handler($e);
            } else {
                header(($_SERVER['SERVER_PROTOCOL'] ?: 'HTTP/1.1').' Internal Server Error', true, 500);
                exit(
                    '<h1>500 Internal Server Error</h1>'.
                    '<h3>Message:'.$e->getMessage().'</h3>'.
                    '<h4>File:'.$e->getFile().' Line:'.$e->getLine().'</h4>'.
                    '<pre>'.$e->getTraceAsString().'</pre>'
                );
            }
        }
    }

    /**
     * Custom error handler.
     */
    public function handleError($errno, $errstr, $errfile, $errline) {

        try {
            $this->error(new ErrorException($errstr, 0, $errno, $errfile, $errline));
        }
        catch (Exception $ex) {
            // if error logging fails, tray again to log the error during error logging :)
            $output = 'message: '.$ex->getMessage().'\n'.
                'trace: '.$ex->getTraceAsString().'\n';
            error_log($output);

            // silently exit
            exit();
        }
    }

    /**
     * Custom exception handler.
     */
    public function handleException(Exception $e) {
        
        try {
            $this->error($e);
        }
        catch (Exception $ex) {
            // if error logging fails, tray again to log the error during error logging :)
            $output = 'message: '.$ex->getMessage().'\n'.
                'trace: '.$ex->getTraceAsString().'\n';
            error_log($output);

            // silently exit
            exit();
        }
    }
}
?>