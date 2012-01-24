<?php

	/**
    * Example usage:
    * <code><pre>
    *   class MyTest extends TestCase {
	* 	    &nbsp;&nbsp;&nbsp;&nbsp;function testMyFeature() {
    *           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$module = ...
    *           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$result = $module->getResult();
    *           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$this->describe("Checking if the result is not NULL")->isNotNull($result);
    *           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$this->describe("Checking if the result is > 10")->isTrue($result > 10);
    *       &nbsp;&nbsp;&nbsp;&nbsp;}
    *   }
	*
	*   die(Test::run(new OpenXTesting()));
    * </pre></code>
    * @package Fabrico\Modules\Utils
    */
	class Test {

		public static function run($arg) {
            $result = "";
			if(is_array($arg)) {
                $numOfTests = count($arg);
                for($i=0; $i<$numOfTests; $i++) {
                    $result .= $arg->run();
                }
            } if(is_string($arg)){
            	inject($arg);
				$parts = explode("/", $arg);
	            $className = str_replace(".php", "", array_pop($parts));
	            $instance = new $className();
	            $isntance->run();
            } else {
                $result = $arg->run();
            }
            return $result;

		}
	};
	 
    /**
    * responsible for displaying the results
    * @package Fabrico\Modules\Utils
    */
	class TestResult {
    
        private $result = "";
        
		public function __construct() {
			$this->result .= '
				<style type="text/css">
					body {
						font-family: Tahoma;
						font-size: 14px;
					}
				</style>
			';
		}
		public function title($str) {
			$this->result .= '<h1 style="font-size:20px;">'.$str.'</h1>';
		}
		public function passed($str) {
			$this->result .= '<p style="color: #256D1B; margin: 0; padding: 0;">Passed &#187; '.$str.'</p>';
		}
		public function failed($str) {
			$this->result .= '<p style="color: #FF0000; font-weight: bold; margin: 0; padding: 0;">Failed &#187; '.$str.'</p>';
		}
		public function sectionStart($title) {
			$this->result .= '<fieldset><legend>'.$title.'</legend>';
		}
		public function sectionEnd() {
			$this->result .= '</fieldset>';
		}
		public function note($str) {
			$this->result .= '
				<p 
					style="
						border-left: solid 10px #42A5CA;
						border-top: solid 1px #49C2BF;
						margin: 2px 0 0 0;
						padding: 5px 0 5px 5px;
						font-size: 12px;
						font-weight: bold;
						color: #42A5CA;
					"
				>'.$str.'</p>';
		}
        public function __toString() {		
            return $this->result;
        }
	};
	
    /**
    * custom exception which help us to investigate the result of the test
    * @package Fabrico\Modules\Utils
    */
	class TestException extends Exception {
	
		public $status;
	
		function __construct($status) {
			$this->status = $status;
		}
	};

    /**
    * the actual test class
    * @package Fabrico\Modules\Utils
    */
	class TestCase {
	
		protected $_result;
		private $_skipMethods = array(
            "__construct",
			"run", 
			"TestCase", 
			"getTraceInformation", 
			"processResult", 
			"isTrue", 
			"isFalse", 
			"isNull", 
			"isNotNull", 
			"isA", 
			"isNotA",
			"isEqual",
			"isNotEqual",
			"isIdentical",
			"isNotIdentical",
			"isEmptyString",
			"isNotEmptyString",
			"isMoreThen",
			"isLessThen",
			"describe"
		);
        
		public function __construct() {
			$this->_result = new TestResult();
		}
		public function run() {
		
			$this->_result->title("class ".get_class($this));
				
			$methods = get_class_methods(get_class($this));
			$numOfMethods = count($methods);
			for($i=0; $i<$numOfMethods; $i++) {
				$method = $methods[$i];
				if(!in_array($method, $this->_skipMethods)) {
					$this->_result->sectionStart("method : ".$method);
					$this->$method();
					$this->_result->sectionEnd();
				}
			}
            
            return $this->_result;
			
		}
		public function describe($str) {
			$this->_result->note($str);
			return $this;
		}
		protected function isTrue($expression, $catch = true) {
			if($catch) {
				try {
					if($expression) {
						throw new TestException(true);
					} else {
						throw new TestException(false);
					}
				} catch(TestException $e) {
					$this->processResult($e);
				}
			} else {
				if(!$expression) {
					throw new TestException(false);
				}
			}
		}
		protected function isFalse($expression, $catch = true) {
			$this->isTrue(!$expression, $catch);
		}
		protected function isNull($expression, $catch = true) {
			$this->isTrue($expression === NULL, $catch);
		}
		protected function isNotNull($expression, $catch = true) {
			$this->isTrue($expression !== NULL, $catch);
		}
		protected function isA($ob, $className) {
			try {
				$this->isNotNull($ob, false);
				$this->isNotNull($className, false);
				$this->isTrue(get_class($ob) == $className);
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isNotA($ob, $className) {
			try {
				$this->isNotNull($ob, false);
				$this->isNotNull($className, false);
				$this->isTrue(get_class($ob) != $className);
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isEqual($a, $b) {
			try {
				$this->isNotNull($a, false);
				$this->isNotNull($b, false);
				$this->isTrue($a == $b);
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isNotEqual($a, $b) {
			try {
				$this->isNotNull($a, false);
				$this->isNotNull($b, false);
				$this->isTrue(!($a == $b));
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isIdentical($a, $b) {
			try {
				$this->isNotNull($a, false);
				$this->isNotNull($b, false);
				$this->isTrue($a === $b);
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isNotIdentical($a, $b) {
			try {
				$this->isNotNull($a, false);
				$this->isNotNull($b, false);
				$this->isTrue(!($a === $b));
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isEmptyString($str) {
			try {
				$this->isNotNull($str, false);
				$this->isIdentical($str, "");
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isNotEmptyString($str) {
			try {
				$this->isNotNull($str, false);
				$this->isNotIdentical($str, "");
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isMoreThen($a, $value) {
			try {
				$this->isNotNull($a, false);
				$this->isTrue($a > $value);
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		protected function isLessThen($a, $value) {
			try {
				$this->isNotNull($a, false);
				$this->isTrue($a < $value);
			} catch(TestException $e) {
				$this->processResult($e);
			}
		}
		private function getTraceInformation($trace) {
			$numOfTraces = count($trace);
			for($i=0; $i<$numOfTraces; $i++) {
				if($trace[$i]["class"] != 'TestCase' && $i > 0) {
					return $trace[$i-1];
				}
			}
			return $trace[0];
		}
		private function processResult($e) {
			$trace = $this->getTraceInformation($e->getTrace());
			if(isset($trace)) {
				$file = basename($trace["file"]);
				$resultMessage = '';
				$resultMessage .= '<strong>'.$file.'</strong>';
				$resultMessage .= ' (line: '.$trace["line"].', method: '.$trace["function"].')';
				if($e->status) {
					$this->_result->passed($resultMessage);
				} else {
					$this->_result->failed($resultMessage);
				}
			}
		}
	
	};
	
?>