<?php
/**
 * Flight: An extensible micro-framework.
 *
 * @copyright   Copyright (c) 2011, Mike Cao <mike@mikecao.com>
 * @license     http://www.opensource.org/licenses/mit-license.php
 * @package Fabrico\Library\Utils
 */
class Request {
    /**
     * Constructor.
     *
     * @param array $config Request configuration
     */
    public function __construct($config = array()) {
        // Default properties
        if (empty($config)) {
            $config = array(
                'requestUrl' => $_SERVER['REQUEST_URI'],
                'host' => $this->getHost(),
                'base' => str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])),
                'method' => $_SERVER['REQUEST_METHOD'],
                'referrer' => isset($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:"",
                'ip' => $_SERVER['REMOTE_ADDR'],
                'ajax' => ((isset($_SERVER['HTTP_X_REQUESTED_WITH'])?$_SERVER['HTTP_X_REQUESTED_WITH']:"") == 'XMLHttpRequest'),
                'scheme' => isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : "",
                'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : "",
                'type' => isset($_SERVER['CONTENT_TYPE'])?$_SERVER['CONTENT_TYPE']:"",
                'length' => isset($_SERVER['CONTENT_LENGTH'])?$_SERVER['CONTENT_LENGTH']:0,
                'query' => array(),
                'body' => $_POST,
                'cookies' => $_COOKIE,
                'files' => $_FILES
            );
        }
        self::init($config);
    }
    /**
     * Initialize request properties.
     *
     * @param array $properties Array of request properties
     */
    public function init($properties) {
        foreach ($properties as $name => $value) {
            $this->$name = $value;
        }
        $this->base = str_replace(" ", "%20", $this->base);
        $this->url = $this->host.($this->base == "/" ? "" : $this->base);
        $this->slug = isset($_GET["slug"]) ? "/".$_GET["slug"] : "/";
        $this->parseQueryParams($this->requestUrl);
        $this->setBody();
    }
    /**
     * Parse query parameters from a URL.
     */
    public function parseQueryParams($url) {
        $this->params = array();
        $args = parse_url($url);
        if (isset($args['query'])) {
            parse_str($args['query'], $this->params);
        }
    }
    /**
    * Get parameter from the query (i.e. ?status=1 -> $req->param("status"))
    */
    public function param($key, $defaultValue = NULL) {
        return isset($this->params[$key]) ? $this->params[$key] : $defaultValue;
    }
	public function getHost() {
		$host = 'http';
		if(isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on") {
			$host .= "s";
		}
		$host .= "://".$_SERVER['HTTP_HOST'];		
		return $host;
	}
    public function header($name) {
        if(strtolower($name) == "content-type")
           return $_SERVER['CONTENT_TYPE'];
        // TODO write all the others available... 
        return $_SERVER["HTTP_".strtoupper($name)];
    }
    private function setBody() {
        if($this->method != "POST" && $this->method != "PUT") {
            return;
        } else if($this->header("content-type") == "application/json") {
            $this->body = json_decode($this->body);
        } else {
            $this->body = $this->arrayToObject($_POST);
        }
    }
    private function arrayToObject($array) {
        if(!is_array($array)) {
            return $array;
        }        
        $object = new stdClass();
        if (is_array($array) && count($array) > 0) {
          foreach ($array as $name=>$value) {
             $name = strtolower(trim($name));
             if (!empty($name)) {
                $object->$name = $this->arrayToObject($value);
             }
          }
         return $object; 
        } else {
          return FALSE;
        }
    }
}
?>