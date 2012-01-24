/*  Copyright Mihai Bazon, 2002-2005  |  www.bazon.net/mishoo
 * -----------------------------------------------------------
 *
 * The DHTML Calendar, version 1.0 "It is happening again"
 *
 * Details and latest version at:
 * www.dynarch.com/projects/calendar
 *
 * This script is developed by Dynarch.com.  Visit us at www.dynarch.com.
 *
 * This script is distributed under the GNU Lesser General Public License.
 * Read the entire license text here: http://www.gnu.org/licenses/lgpl.html
 */

// $Id: calendar.js,v 1.53 2006/02/11 12:32:59 mishoo Exp $

/** The Calendar object constructor. */
Calendar = function (firstDayOfWeek, dateStr, onSelected, onClose) {
	// member variables
	this.activeDiv = null;
	this.currentDateEl = null;
	this.getDateStatus = null;
	this.getDateToolTip = null;
	this.getDateText = null;
	this.timeout = null;
	this.onSelected = onSelected || null;
	this.onClose = onClose || null;
	this.dragging = false;
	this.hidden = false;
	this.minYear = 1970;
	this.maxYear = 2050;
	this.dateFormat = Calendar._TT["DEF_DATE_FORMAT"];
	this.ttDateFormat = Calendar._TT["TT_DATE_FORMAT"];
	this.isPopup = true;
	this.weekNumbers = true;
	this.firstDayOfWeek = typeof firstDayOfWeek == "number" ? firstDayOfWeek : Calendar._FD; // 0 for Sunday, 1 for Monday, etc.
	this.showsOtherMonths = false;
	this.dateStr = dateStr;
	this.ar_days = null;
	this.showsTime = false;
	this.time24 = true;
	this.yearStep = 2;
	this.hiliteToday = true;
	this.multiple = null;
	// HTML elements
	this.table = null;
	this.element = null;
	this.tbody = null;
	this.firstdayname = null;
	// Combo boxes
	this.monthsCombo = null;
	this.yearsCombo = null;
	this.hilitedMonth = null;
	this.activeMonth = null;
	this.hilitedYear = null;
	this.activeYear = null;
	// Information
	this.dateClicked = false;

	// one-time initializations
	if (typeof Calendar._SDN == "undefined") {
		// table of short day names
		if (typeof Calendar._SDN_len == "undefined")
			Calendar._SDN_len = 3;
		var ar = new Array();
		for (var i = 8; i > 0;) {
			ar[--i] = Calendar._DN[i].substr(0, Calendar._SDN_len);
		}
		Calendar._SDN = ar;
		// table of short month names
		if (typeof Calendar._SMN_len == "undefined")
			Calendar._SMN_len = 3;
		ar = new Array();
		for (var i = 12; i > 0;) {
			ar[--i] = Calendar._MN[i].substr(0, Calendar._SMN_len);
		}
		Calendar._SMN = ar;
	}
};

// ** constants

/// "static", needed for event handlers.
Calendar._C = null;

/// detect a special case of "web browser"
Calendar.is_ie = ( /msie/i.test(navigator.userAgent) &&
		   !/opera/i.test(navigator.userAgent) );

Calendar.is_ie5 = ( Calendar.is_ie && /msie 5\.0/i.test(navigator.userAgent) );

/// detect Opera browser
Calendar.is_opera = /opera/i.test(navigator.userAgent);

/// detect KHTML-based browsers
Calendar.is_khtml = /Konqueror|Safari|KHTML/i.test(navigator.userAgent);

// BEGIN: UTILITY FUNCTIONS; beware that these might be moved into a separate
//        library, at some point.

Calendar.getAbsolutePos = function(el) {
	var SL = 0, ST = 0;
	var is_div = /^div$/i.test(el.tagName);
	if (is_div && el.scrollLeft)
		SL = el.scrollLeft;
	if (is_div && el.scrollTop)
		ST = el.scrollTop;
	var r = { x: el.offsetLeft - SL, y: el.offsetTop - ST };
	if (el.offsetParent) {
		var tmp = this.getAbsolutePos(el.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

Calendar.isRelated = function (el, evt) {
	var related = evt.relatedTarget;
	if (!related) {
		var type = evt.type;
		if (type == "mouseover") {
			related = evt.fromElement;
		} else if (type == "mouseout") {
			related = evt.toElement;
		}
	}
	while (related) {
		if (related == el) {
			return true;
		}
		try {
			related = related.parentNode;
		} catch(e) {
			return true;
		}
	}
	return false;
};

Calendar.removeClass = function(el, className) {
	if (!(el && el.className)) {
		return;
	}
	var cls = el.className.split(" ");
	var ar = new Array();
	for (var i = cls.length; i > 0;) {
		if (cls[--i] != className) {
			ar[ar.length] = cls[i];
		}
	}
	el.className = ar.join(" ");
};

Calendar.addClass = function(el, className) {
	Calendar.removeClass(el, className);
	el.className += " " + className;
};

// FIXME: the following 2 functions totally suck, are useless and should be replaced immediately.
Calendar.getElement = function(ev) {
	var f = Calendar.is_ie ? window.event.srcElement : ev.currentTarget;
	while (f.nodeType != 1 || /^div$/i.test(f.tagName))
		f = f.parentNode;
	return f;
};

Calendar.getTargetElement = function(ev) {
	var f = Calendar.is_ie ? window.event.srcElement : ev.target;
	while (f.nodeType != 1)
		f = f.parentNode;
	return f;
};

Calendar.stopEvent = function(ev) {
	ev || (ev = window.event);
	if (Calendar.is_ie) {
		ev.cancelBubble = true;
		ev.returnValue = false;
	} else {
		ev.preventDefault();
		ev.stopPropagation();
	}
	return false;
};

Calendar.addEvent = function(el, evname, func) {
	if (el.attachEvent) { // IE
		el.attachEvent("on" + evname, func);
	} else if (el.addEventListener) { // Gecko / W3C
		el.addEventListener(evname, func, true);
	} else {
		el["on" + evname] = func;
	}
};

Calendar.removeEvent = function(el, evname, func) {
	if (el.detachEvent) { // IE
		el.detachEvent("on" + evname, func);
	} else if (el.removeEventListener) { // Gecko / W3C
		el.removeEventListener(evname, func, true);
	} else {
		el["on" + evname] = null;
	}
};

Calendar.createElement = function(type, parent) {
	var el = null;
	if (document.createElementNS) {
		// use the XHTML namespace; IE won't normally get here unless
		// _they_ "fix" the DOM2 implementation.
		el = document.createElementNS("http://www.w3.org/1999/xhtml", type);
	} else {
		el = document.createElement(type);
	}
	if (typeof parent != "undefined") {
		parent.appendChild(el);
	}
	return el;
};

// END: UTILITY FUNCTIONS

// BEGIN: CALENDAR STATIC FUNCTIONS

/** Internal -- adds a set of events to make some element behave like a button. */
Calendar._add_evs = function(el) {
	with (Calendar) {
		addEvent(el, "mouseover", dayMouseOver);
		addEvent(el, "mousedown", dayMouseDown);
		addEvent(el, "mouseout", dayMouseOut);
		if (is_ie) {
			addEvent(el, "dblclick", dayMouseDblClick);
			el.setAttribute("unselectable", true);
		}
	}
};

Calendar.findMonth = function(el) {
	if (typeof el.month != "undefined") {
		return el;
	} else if (typeof el.parentNode.month != "undefined") {
		return el.parentNode;
	}
	return null;
};

Calendar.findYear = function(el) {
	if (typeof el.year != "undefined") {
		return el;
	} else if (typeof el.parentNode.year != "undefined") {
		return el.parentNode;
	}
	return null;
};

Calendar.showMonthsCombo = function () {
	var cal = Calendar._C;
	if (!cal) {
		return false;
	}
	var cal = cal;
	var cd = cal.activeDiv;
	var mc = cal.monthsCombo;
	if (cal.hilitedMonth) {
		Calendar.removeClass(cal.hilitedMonth, "hilite");
	}
	if (cal.activeMonth) {
		Calendar.removeClass(cal.activeMonth, "active");
	}
	var mon = cal.monthsCombo.getElementsByTagName("div")[cal.date.getMonth()];
	Calendar.addClass(mon, "active");
	cal.activeMonth = mon;
	var s = mc.style;
	s.display = "block";
	if (cd.navtype < 0)
		s.left = cd.offsetLeft + "px";
	else {
		var mcw = mc.offsetWidth;
		if (typeof mcw == "undefined")
			// Konqueror brain-dead techniques
			mcw = 50;
		s.left = (cd.offsetLeft + cd.offsetWidth - mcw) + "px";
	}
	s.top = (cd.offsetTop + cd.offsetHeight) + "px";
};

Calendar.showYearsCombo = function (fwd) {
	var cal = Calendar._C;
	if (!cal) {
		return false;
	}
	var cal = cal;
	var cd = cal.activeDiv;
	var yc = cal.yearsCombo;
	if (cal.hilitedYear) {
		Calendar.removeClass(cal.hilitedYear, "hilite");
	}
	if (cal.activeYear) {
		Calendar.removeClass(cal.activeYear, "active");
	}
	cal.activeYear = null;
	var Y = cal.date.getFullYear() + (fwd ? 1 : -1);
	var yr = yc.firstChild;
	var show = false;
	for (var i = 12; i > 0; --i) {
		if (Y >= cal.minYear && Y <= cal.maxYear) {
			yr.innerHTML = Y;
			yr.year = Y;
			yr.style.display = "block";
			show = true;
		} else {
			yr.style.display = "none";
		}
		yr = yr.nextSibling;
		Y += fwd ? cal.yearStep : -cal.yearStep;
	}
	if (show) {
		var s = yc.style;
		s.display = "block";
		if (cd.navtype < 0)
			s.left = cd.offsetLeft + "px";
		else {
			var ycw = yc.offsetWidth;
			if (typeof ycw == "undefined")
				// Konqueror brain-dead techniques
				ycw = 50;
			s.left = (cd.offsetLeft + cd.offsetWidth - ycw) + "px";
		}
		s.top = (cd.offsetTop + cd.offsetHeight) + "px";
	}
};

// event handlers

Calendar.tableMouseUp = function(ev) {
	var cal = Calendar._C;
	if (!cal) {
		return false;
	}
	if (cal.timeout) {
		clearTimeout(cal.timeout);
	}
	var el = cal.activeDiv;
	if (!el) {
		return false;
	}
	var target = Calendar.getTargetElement(ev);
	ev || (ev = window.event);
	Calendar.removeClass(el, "active");
	if (target == el || target.parentNode == el) {
		Calendar.cellClick(el, ev);
	}
	var mon = Calendar.findMonth(target);
	var date = null;
	if (mon) {
		date = new Date(cal.date);
		if (mon.month != date.getMonth()) {
			date.setMonth(mon.month);
			cal.setDate(date);
			cal.dateClicked = false;
			cal.callHandler();
		}
	} else {
		var year = Calendar.findYear(target);
		if (year) {
			date = new Date(cal.date);
			if (year.year != date.getFullYear()) {
				date.setFullYear(year.year);
				cal.setDate(date);
				cal.dateClicked = false;
				cal.callHandler();
			}
		}
	}
	with (Calendar) {
		removeEvent(document, "mouseup", tableMouseUp);
		removeEvent(document, "mouseover", tableMouseOver);
		removeEvent(document, "mousemove", tableMouseOver);
		cal._hideCombos();
		_C = null;
		return stopEvent(ev);
	}
};

Calendar.tableMouseOver = function (ev) {
	var cal = Calendar._C;
	if (!cal) {
		return;
	}
	var el = cal.activeDiv;
	var target = Calendar.getTargetElement(ev);
	if (target == el || target.parentNode == el) {
		Calendar.addClass(el, "hilite active");
		Calendar.addClass(el.parentNode, "rowhilite");
	} else {
		if (typeof el.navtype == "undefined" || (el.navtype != 50 && (el.navtype == 0 || Math.abs(el.navtype) > 2)))
			Calendar.removeClass(el, "active");
		Calendar.removeClass(el, "hilite");
		Calendar.removeClass(el.parentNode, "rowhilite");
	}
	ev || (ev = window.event);
	if (el.navtype == 50 && target != el) {
		var pos = Calendar.getAbsolutePos(el);
		var w = el.offsetWidth;
		var x = ev.clientX;
		var dx;
		var decrease = true;
		if (x > pos.x + w) {
			dx = x - pos.x - w;
			decrease = false;
		} else
			dx = pos.x - x;

		if (dx < 0) dx = 0;
		var range = el._range;
		var current = el._current;
		var count = Math.floor(dx / 10) % range.length;
		for (var i = range.length; --i >= 0;)
			if (range[i] == current)
				break;
		while (count-- > 0)
			if (decrease) {
				if (--i < 0)
					i = range.length - 1;
			} else if ( ++i >= range.length )
				i = 0;
		var newval = range[i];
		el.innerHTML = newval;

		cal.onUpdateTime();
	}
	var mon = Calendar.findMonth(target);
	if (mon) {
		if (mon.month != cal.date.getMonth()) {
			if (cal.hilitedMonth) {
				Calendar.removeClass(cal.hilitedMonth, "hilite");
			}
			Calendar.addClass(mon, "hilite");
			cal.hilitedMonth = mon;
		} else if (cal.hilitedMonth) {
			Calendar.removeClass(cal.hilitedMonth, "hilite");
		}
	} else {
		if (cal.hilitedMonth) {
			Calendar.removeClass(cal.hilitedMonth, "hilite");
		}
		var year = Calendar.findYear(target);
		if (year) {
			if (year.year != cal.date.getFullYear()) {
				if (cal.hilitedYear) {
					Calendar.removeClass(cal.hilitedYear, "hilite");
				}
				Calendar.addClass(year, "hilite");
				cal.hilitedYear = year;
			} else if (cal.hilitedYear) {
				Calendar.removeClass(cal.hilitedYear, "hilite");
			}
		} else if (cal.hilitedYear) {
			Calendar.removeClass(cal.hilitedYear, "hilite");
		}
	}
	return Calendar.stopEvent(ev);
};

Calendar.tableMouseDown = function (ev) {
	if (Calendar.getTargetElement(ev) == Calendar.getElement(ev)) {
		return Calendar.stopEvent(ev);
	}
};

Calendar.calDragIt = function (ev) {
	var cal = Calendar._C;
	if (!(cal && cal.dragging)) {
		return false;
	}
	var posX;
	var posY;
	if (Calendar.is_ie) {
		posY = window.event.clientY + document.body.scrollTop;
		posX = window.event.clientX + document.body.scrollLeft;
	} else {
		posX = ev.pageX;
		posY = ev.pageY;
	}
	cal.hideShowCovered();
	var st = cal.element.style;
	st.left = (posX - cal.xOffs) + "px";
	st.top = (posY - cal.yOffs) + "px";
	return Calendar.stopEvent(ev);
};

Calendar.calDragEnd = function (ev) {
	var cal = Calendar._C;
	if (!cal) {
		return false;
	}
	cal.dragging = false;
	with (Calendar) {
		removeEvent(document, "mousemove", calDragIt);
		removeEvent(document, "mouseup", calDragEnd);
		tableMouseUp(ev);
	}
	cal.hideShowCovered();
};

Calendar.dayMouseDown = function(ev) {
	var el = Calendar.getElement(ev);
	if (el.disabled) {
		return false;
	}
	var cal = el.calendar;
	cal.activeDiv = el;
	Calendar._C = cal;
	if (el.navtype != 300) with (Calendar) {
		if (el.navtype == 50) {
			el._current = el.innerHTML;
			addEvent(document, "mousemove", tableMouseOver);
		} else
			addEvent(document, Calendar.is_ie5 ? "mousemove" : "mouseover", tableMouseOver);
		addClass(el, "hilite active");
		addEvent(document, "mouseup", tableMouseUp);
	} else if (cal.isPopup) {
		cal._dragStart(ev);
	}
	if (el.navtype == -1 || el.navtype == 1) {
		if (cal.timeout) clearTimeout(cal.timeout);
		cal.timeout = setTimeout("Calendar.showMonthsCombo()", 250);
	} else if (el.navtype == -2 || el.navtype == 2) {
		if (cal.timeout) clearTimeout(cal.timeout);
		cal.timeout = setTimeout((el.navtype > 0) ? "Calendar.showYearsCombo(true)" : "Calendar.showYearsCombo(false)", 250);
	} else {
		cal.timeout = null;
	}
	return Calendar.stopEvent(ev);
};

Calendar.dayMouseDblClick = function(ev) {
	Calendar.cellClick(Calendar.getElement(ev), ev || window.event);
	if (Calendar.is_ie) {
		document.selection.empty();
	}
};

Calendar.dayMouseOver = function(ev) {
	var el = Calendar.getElement(ev);
	if (Calendar.isRelated(el, ev) || Calendar._C || el.disabled) {
		return false;
	}
	if (el.ttip) {
		if (el.ttip.substr(0, 1) == "_") {
			el.ttip = el.caldate.print(el.calendar.ttDateFormat) + el.ttip.substr(1);
		}
		el.calendar.tooltips.innerHTML = el.ttip;
	}
	if (el.navtype != 300) {
		Calendar.addClass(el, "hilite");
		if (el.caldate) {
			Calendar.addClass(el.parentNode, "rowhilite");
			var cal = el.calendar;
			if (cal && cal.getDateToolTip) {
				var d = el.caldate;
				window.status = d;
				el.title = cal.getDateToolTip(d, d.getFullYear(), d.getMonth(), d.getDate());
			}
		}
	}
	return Calendar.stopEvent(ev);
};

Calendar.dayMouseOut = function(ev) {
	with (Calendar) {
		var el = getElement(ev);
		if (isRelated(el, ev) || _C || el.disabled)
			return false;
		removeClass(el, "hilite");
		if (el.caldate)
			removeClass(el.parentNode, "rowhilite");
		if (el.calendar)
			el.calendar.tooltips.innerHTML = _TT["SEL_DATE"];
		// return stopEvent(ev);
	}
};

/**
 *  A generic "click" handler :) handles all types of buttons defined in this
 *  calendar.
 */
Calendar.cellClick = function(el, ev) {
	var cal = el.calendar;
	var closing = false;
	var newdate = false;
	var date = null;
	if (typeof el.navtype == "undefined") {
		if (cal.currentDateEl) {
			Calendar.removeClass(cal.currentDateEl, "selected");
			Calendar.addClass(el, "selected");
			closing = (cal.currentDateEl == el);
			if (!closing) {
				cal.currentDateEl = el;
			}
		}
		cal.date.setDateOnly(el.caldate);
		date = cal.date;
		var other_month = !(cal.dateClicked = !el.otherMonth);
		if (!other_month && !cal.currentDateEl && cal.multiple)
			cal._toggleMultipleDate(new Date(date));
		else
			newdate = !el.disabled;
		// a date was clicked
		if (other_month)
			cal._init(cal.firstDayOfWeek, date);
	} else {
		if (el.navtype == 200) {
			Calendar.removeClass(el, "hilite");
			cal.callCloseHandler();
			return;
		}
		date = new Date(cal.date);
		if (el.navtype == 0)
			date.setDateOnly(new Date()); // TODAY
		// unless "today" was clicked, we assume no date was clicked so
		// the selected handler will know not to close the calenar when
		// in single-click mode.
		// cal.dateClicked = (el.navtype == 0);
		cal.dateClicked = false;
		var year = date.getFullYear();
		var mon = date.getMonth();
		function setMonth(m) {
			var day = date.getDate();
			var max = date.getMonthDays(m);
			if (day > max) {
				date.setDate(max);
			}
			date.setMonth(m);
		};
		switch (el.navtype) {
		    case 400:
			Calendar.removeClass(el, "hilite");
			var text = Calendar._TT["ABOUT"];
			if (typeof text != "undefined") {
				text += cal.showsTime ? Calendar._TT["ABOUT_TIME"] : "";
			} else {
				// FIXME: this should be removed as soon as lang files get updated!
				text = "Help and about box text is not translated into this language.\n" +
					"If you know this language and you feel generous please update\n" +
					"the corresponding file in \"lang\" subdir to match calendar-en.js\n" +
					"and send it back to <mihai_bazon@yahoo.com> to get it into the distribution  ;-)\n\n" +
					"Thank you!\n" +
					"http://dynarch.com/mishoo/calendar.epl\n";
			}
			alert(text);
			return;
		    case -2:
			if (year > cal.minYear) {
				date.setFullYear(year - 1);
			}
			break;
		    case -1:
			if (mon > 0) {
				setMonth(mon - 1);
			} else if (year-- > cal.minYear) {
				date.setFullYear(year);
				setMonth(11);
			}
			break;
		    case 1:
			if (mon < 11) {
				setMonth(mon + 1);
			} else if (year < cal.maxYear) {
				date.setFullYear(year + 1);
				setMonth(0);
			}
			break;
		    case 2:
			if (year < cal.maxYear) {
				date.setFullYear(year + 1);
			}
			break;
		    case 100:
			cal.setFirstDayOfWeek(el.fdow);
			return;
		    case 50:
			var range = el._range;
			var current = el.innerHTML;
			for (var i = range.length; --i >= 0;)
				if (range[i] == current)
					break;
			if (ev && ev.shiftKey) {
				if (--i < 0)
					i = range.length - 1;
			} else if ( ++i >= range.length )
				i = 0;
			var newval = range[i];
			el.innerHTML = newval;
			cal.onUpdateTime();
			return;
		    case 0:
			// TODAY will bring us here
			if ((typeof cal.getDateStatus == "function") &&
			    cal.getDateStatus(date, date.getFullYear(), date.getMonth(), date.getDate())) {
				return false;
			}
			break;
		}
		if (!date.equalsTo(cal.date)) {
			cal.setDate(date);
			newdate = true;
		} else if (el.navtype == 0)
			newdate = closing = true;
	}
	if (newdate) {
		ev && cal.callHandler();
	}
	if (closing) {
		Calendar.removeClass(el, "hilite");
		ev && cal.callCloseHandler();
	}
};

// END: CALENDAR STATIC FUNCTIONS

// BEGIN: CALENDAR OBJECT FUNCTIONS

/**
 *  This function creates the calendar inside the given parent.  If _par is
 *  null than it creates a popup calendar inside the BODY element.  If _par is
 *  an element, be it BODY, then it creates a non-popup calendar (still
 *  hidden).  Some properties need to be set before calling this function.
 */
Calendar.prototype.create = function (_par) {
	var parent = null;
	if (! _par) {
		// default parent is the document body, in which case we create
		// a popup calendar.
		parent = document.getElementsByTagName("body")[0];
		this.isPopup = true;
	} else {
		parent = _par;
		this.isPopup = false;
	}
	this.date = this.dateStr ? new Date(this.dateStr) : new Date();

	var table = Calendar.createElement("table");
	this.table = table;
	table.cellSpacing = 0;
	table.cellPadding = 0;
	table.calendar = this;
	Calendar.addEvent(table, "mousedown", Calendar.tableMouseDown);

	var div = Calendar.createElement("div");
	this.element = div;
	div.className = "calendar";
	if (this.isPopup) {
		div.style.position = "absolute";
		div.style.display = "none";
	}
	div.appendChild(table);

	var thead = Calendar.createElement("thead", table);
	var cell = null;
	var row = null;

	var cal = this;
	var hh = function (text, cs, navtype) {
		cell = Calendar.createElement("td", row);
		cell.colSpan = cs;
		cell.className = "button";
		if (navtype != 0 && Math.abs(navtype) <= 2)
			cell.className += " nav";
		Calendar._add_evs(cell);
		cell.calendar = cal;
		cell.navtype = navtype;
		cell.innerHTML = "<div unselectable='on'>" + text + "</div>";
		return cell;
	};

	row = Calendar.createElement("tr", thead);
	var title_length = 6;
	(this.isPopup) && --title_length;
	(this.weekNumbers) && ++title_length;

	hh("?", 1, 400).ttip = Calendar._TT["INFO"];
	this.title = hh("", title_length, 300);
	this.title.className = "title";
	if (this.isPopup) {
		this.title.ttip = Calendar._TT["DRAG_TO_MOVE"];
		this.title.style.cursor = "move";
		hh("&#x00d7;", 1, 200).ttip = Calendar._TT["CLOSE"];
	}

	row = Calendar.createElement("tr", thead);
	row.className = "headrow";

	this._nav_py = hh("&#x00ab;", 1, -2);
	this._nav_py.ttip = Calendar._TT["PREV_YEAR"];

	this._nav_pm = hh("&#x2039;", 1, -1);
	this._nav_pm.ttip = Calendar._TT["PREV_MONTH"];

	this._nav_now = hh(Calendar._TT["TODAY"], this.weekNumbers ? 4 : 3, 0);
	this._nav_now.ttip = Calendar._TT["GO_TODAY"];

	this._nav_nm = hh("&#x203a;", 1, 1);
	this._nav_nm.ttip = Calendar._TT["NEXT_MONTH"];

	this._nav_ny = hh("&#x00bb;", 1, 2);
	this._nav_ny.ttip = Calendar._TT["NEXT_YEAR"];

	// day names
	row = Calendar.createElement("tr", thead);
	row.className = "daynames";
	if (this.weekNumbers) {
		cell = Calendar.createElement("td", row);
		cell.className = "name wn";
		cell.innerHTML = Calendar._TT["WK"];
	}
	for (var i = 7; i > 0; --i) {
		cell = Calendar.createElement("td", row);
		if (!i) {
			cell.navtype = 100;
			cell.calendar = this;
			Calendar._add_evs(cell);
		}
	}
	this.firstdayname = (this.weekNumbers) ? row.firstChild.nextSibling : row.firstChild;
	this._displayWeekdays();

	var tbody = Calendar.createElement("tbody", table);
	this.tbody = tbody;

	for (i = 6; i > 0; --i) {
		row = Calendar.createElement("tr", tbody);
		if (this.weekNumbers) {
			cell = Calendar.createElement("td", row);
		}
		for (var j = 7; j > 0; --j) {
			cell = Calendar.createElement("td", row);
			cell.calendar = this;
			Calendar._add_evs(cell);
		}
	}

	if (this.showsTime) {
		row = Calendar.createElement("tr", tbody);
		row.className = "time";

		cell = Calendar.createElement("td", row);
		cell.className = "time";
		cell.colSpan = 2;
		cell.innerHTML = Calendar._TT["TIME"] || "&nbsp;";

		cell = Calendar.createElement("td", row);
		cell.className = "time";
		cell.colSpan = this.weekNumbers ? 4 : 3;

		(function(){
			function makeTimePart(className, init, range_start, range_end) {
				var part = Calendar.createElement("span", cell);
				part.className = className;
				part.innerHTML = init;
				part.calendar = cal;
				part.ttip = Calendar._TT["TIME_PART"];
				part.navtype = 50;
				part._range = [];
				if (typeof range_start != "number")
					part._range = range_start;
				else {
					for (var i = range_start; i <= range_end; ++i) {
						var txt;
						if (i < 10 && range_end >= 10) txt = '0' + i;
						else txt = '' + i;
						part._range[part._range.length] = txt;
					}
				}
				Calendar._add_evs(part);
				return part;
			};
			var hrs = cal.date.getHours();
			var mins = cal.date.getMinutes();
			var t12 = !cal.time24;
			var pm = (hrs > 12);
			if (t12 && pm) hrs -= 12;
			var H = makeTimePart("hour", hrs, t12 ? 1 : 0, t12 ? 12 : 23);
			var span = Calendar.createElement("span", cell);
			span.innerHTML = ":";
			span.className = "colon";
			var M = makeTimePart("minute", mins, 0, 59);
			var AP = null;
			cell = Calendar.createElement("td", row);
			cell.className = "time";
			cell.colSpan = 2;
			if (t12)
				AP = makeTimePart("ampm", pm ? "pm" : "am", ["am", "pm"]);
			else
				cell.innerHTML = "&nbsp;";

			cal.onSetTime = function() {
				var pm, hrs = this.date.getHours(),
					mins = this.date.getMinutes();
				if (t12) {
					pm = (hrs >= 12);
					if (pm) hrs -= 12;
					if (hrs == 0) hrs = 12;
					AP.innerHTML = pm ? "pm" : "am";
				}
				H.innerHTML = (hrs < 10) ? ("0" + hrs) : hrs;
				M.innerHTML = (mins < 10) ? ("0" + mins) : mins;
			};

			cal.onUpdateTime = function() {
				var date = this.date;
				var h = parseInt(H.innerHTML, 10);
				if (t12) {
					if (/pm/i.test(AP.innerHTML) && h < 12)
						h += 12;
					else if (/am/i.test(AP.innerHTML) && h == 12)
						h = 0;
				}
				var d = date.getDate();
				var m = date.getMonth();
				var y = date.getFullYear();
				date.setHours(h);
				date.setMinutes(parseInt(M.innerHTML, 10));
				date.setFullYear(y);
				date.setMonth(m);
				date.setDate(d);
				this.dateClicked = false;
				this.callHandler();
			};
		})();
	} else {
		this.onSetTime = this.onUpdateTime = function() {};
	}

	var tfoot = Calendar.createElement("tfoot", table);

	row = Calendar.createElement("tr", tfoot);
	row.className = "footrow";

	cell = hh(Calendar._TT["SEL_DATE"], this.weekNumbers ? 8 : 7, 300);
	cell.className = "ttip";
	if (this.isPopup) {
		cell.ttip = Calendar._TT["DRAG_TO_MOVE"];
		cell.style.cursor = "move";
	}
	this.tooltips = cell;

	div = Calendar.createElement("div", this.element);
	this.monthsCombo = div;
	div.className = "combo";
	for (i = 0; i < Calendar._MN.length; ++i) {
		var mn = Calendar.createElement("div");
		mn.className = Calendar.is_ie ? "label-IEfix" : "label";
		mn.month = i;
		mn.innerHTML = Calendar._SMN[i];
		div.appendChild(mn);
	}

	div = Calendar.createElement("div", this.element);
	this.yearsCombo = div;
	div.className = "combo";
	for (i = 12; i > 0; --i) {
		var yr = Calendar.createElement("div");
		yr.className = Calendar.is_ie ? "label-IEfix" : "label";
		div.appendChild(yr);
	}

	this._init(this.firstDayOfWeek, this.date);
	parent.appendChild(this.element);
};

/** keyboard navigation, only for popup calendars */
Calendar._keyEvent = function(ev) {
	var cal = window._dynarch_popupCalendar;
	if (!cal || cal.multiple)
		return false;
	(Calendar.is_ie) && (ev = window.event);
	var act = (Calendar.is_ie || ev.type == "keypress"),
		K = ev.keyCode;
	if (ev.ctrlKey) {
		switch (K) {
		    case 37: // KEY left
			act && Calendar.cellClick(cal._nav_pm);
			break;
		    case 38: // KEY up
			act && Calendar.cellClick(cal._nav_py);
			break;
		    case 39: // KEY right
			act && Calendar.cellClick(cal._nav_nm);
			break;
		    case 40: // KEY down
			act && Calendar.cellClick(cal._nav_ny);
			break;
		    default:
			return false;
		}
	} else switch (K) {
	    case 32: // KEY space (now)
		Calendar.cellClick(cal._nav_now);
		break;
	    case 27: // KEY esc
		act && cal.callCloseHandler();
		break;
	    case 37: // KEY left
	    case 38: // KEY up
	    case 39: // KEY right
	    case 40: // KEY down
		if (act) {
			var prev, x, y, ne, el, step;
			prev = K == 37 || K == 38;
			step = (K == 37 || K == 39) ? 1 : 7;
			function setVars() {
				el = cal.currentDateEl;
				var p = el.pos;
				x = p & 15;
				y = p >> 4;
				ne = cal.ar_days[y][x];
			};setVars();
			function prevMonth() {
				var date = new Date(cal.date);
				date.setDate(date.getDate() - step);
				cal.setDate(date);
			};
			function nextMonth() {
				var date = new Date(cal.date);
				date.setDate(date.getDate() + step);
				cal.setDate(date);
			};
			while (1) {
				switch (K) {
				    case 37: // KEY left
					if (--x >= 0)
						ne = cal.ar_days[y][x];
					else {
						x = 6;
						K = 38;
						continue;
					}
					break;
				    case 38: // KEY up
					if (--y >= 0)
						ne = cal.ar_days[y][x];
					else {
						prevMonth();
						setVars();
					}
					break;
				    case 39: // KEY right
					if (++x < 7)
						ne = cal.ar_days[y][x];
					else {
						x = 0;
						K = 40;
						continue;
					}
					break;
				    case 40: // KEY down
					if (++y < cal.ar_days.length)
						ne = cal.ar_days[y][x];
					else {
						nextMonth();
						setVars();
					}
					break;
				}
				break;
			}
			if (ne) {
				if (!ne.disabled)
					Calendar.cellClick(ne);
				else if (prev)
					prevMonth();
				else
					nextMonth();
			}
		}
		break;
	    case 13: // KEY enter
		if (act)
			Calendar.cellClick(cal.currentDateEl, ev);
		break;
	    default:
		return false;
	}
	return Calendar.stopEvent(ev);
};

/**
 *  (RE)Initializes the calendar to the given date and firstDayOfWeek
 */
Calendar.prototype._init = function (firstDayOfWeek, date) {
	var today = new Date(),
		TY = today.getFullYear(),
		TM = today.getMonth(),
		TD = today.getDate();
	this.table.style.visibility = "hidden";
	var year = date.getFullYear();
	if (year < this.minYear) {
		year = this.minYear;
		date.setFullYear(year);
	} else if (year > this.maxYear) {
		year = this.maxYear;
		date.setFullYear(year);
	}
	this.firstDayOfWeek = firstDayOfWeek;
	this.date = new Date(date);
	var month = date.getMonth();
	var mday = date.getDate();
	var no_days = date.getMonthDays();

	// calendar voodoo for computing the first day that would actually be
	// displayed in the calendar, even if it's from the previous month.
	// WARNING: this is magic. ;-)
	date.setDate(1);
	var day1 = (date.getDay() - this.firstDayOfWeek) % 7;
	if (day1 < 0)
		day1 += 7;
	date.setDate(-day1);
	date.setDate(date.getDate() + 1);

	var row = this.tbody.firstChild;
	var MN = Calendar._SMN[month];
	var ar_days = this.ar_days = new Array();
	var weekend = Calendar._TT["WEEKEND"];
	var dates = this.multiple ? (this.datesCells = {}) : null;
	for (var i = 0; i < 6; ++i, row = row.nextSibling) {
		var cell = row.firstChild;
		if (this.weekNumbers) {
			cell.className = "day wn";
			cell.innerHTML = date.getWeekNumber();
			cell = cell.nextSibling;
		}
		row.className = "daysrow";
		var hasdays = false, iday, dpos = ar_days[i] = [];
		for (var j = 0; j < 7; ++j, cell = cell.nextSibling, date.setDate(iday + 1)) {
			iday = date.getDate();
			var wday = date.getDay();
			cell.className = "day";
			cell.pos = i << 4 | j;
			dpos[j] = cell;
			var current_month = (date.getMonth() == month);
			if (!current_month) {
				if (this.showsOtherMonths) {
					cell.className += " othermonth";
					cell.otherMonth = true;
				} else {
					cell.className = "emptycell";
					cell.innerHTML = "&nbsp;";
					cell.disabled = true;
					continue;
				}
			} else {
				cell.otherMonth = false;
				hasdays = true;
			}
			cell.disabled = false;
			cell.innerHTML = this.getDateText ? this.getDateText(date, iday) : iday;
			if (dates)
				dates[date.print("%Y%m%d")] = cell;
			if (this.getDateStatus) {
				var status = this.getDateStatus(date, year, month, iday);
				if (status === true) {
					cell.className += " disabled";
					cell.disabled = true;
				} else {
					if (/disabled/i.test(status))
						cell.disabled = true;
					cell.className += " " + status;
				}
			}
			if (!cell.disabled) {
				cell.caldate = new Date(date);
				cell.ttip = "_";
				if (!this.multiple && current_month
				    && iday == mday && this.hiliteToday) {
					cell.className += " selected";
					this.currentDateEl = cell;
				}
				if (date.getFullYear() == TY &&
				    date.getMonth() == TM &&
				    iday == TD) {
					cell.className += " today";
					cell.ttip += Calendar._TT["PART_TODAY"];
				}
				if (weekend.indexOf(wday.toString()) != -1)
					cell.className += cell.otherMonth ? " oweekend" : " weekend";
			}
		}
		if (!(hasdays || this.showsOtherMonths))
			row.className = "emptyrow";
	}
	this.title.innerHTML = Calendar._MN[month] + ", " + year;
	this.onSetTime();
	this.table.style.visibility = "visible";
	this._initMultipleDates();
	// PROFILE
	// this.tooltips.innerHTML = "Generated in " + ((new Date()) - today) + " ms";
};

Calendar.prototype._initMultipleDates = function() {
	if (this.multiple) {
		for (var i in this.multiple) {
			var cell = this.datesCells[i];
			var d = this.multiple[i];
			if (!d)
				continue;
			if (cell)
				cell.className += " selected";
		}
	}
};

Calendar.prototype._toggleMultipleDate = function(date) {
	if (this.multiple) {
		var ds = date.print("%Y%m%d");
		var cell = this.datesCells[ds];
		if (cell) {
			var d = this.multiple[ds];
			if (!d) {
				Calendar.addClass(cell, "selected");
				this.multiple[ds] = date;
			} else {
				Calendar.removeClass(cell, "selected");
				delete this.multiple[ds];
			}
		}
	}
};

Calendar.prototype.setDateToolTipHandler = function (unaryFunction) {
	this.getDateToolTip = unaryFunction;
};

/**
 *  Calls _init function above for going to a certain date (but only if the
 *  date is different than the currently selected one).
 */
Calendar.prototype.setDate = function (date) {
	if (!date.equalsTo(this.date)) {
		this._init(this.firstDayOfWeek, date);
	}
};

/**
 *  Refreshes the calendar.  Useful if the "disabledHandler" function is
 *  dynamic, meaning that the list of disabled date can change at runtime.
 *  Just * call this function if you think that the list of disabled dates
 *  should * change.
 */
Calendar.prototype.refresh = function () {
	this._init(this.firstDayOfWeek, this.date);
};

/** Modifies the "firstDayOfWeek" parameter (pass 0 for Synday, 1 for Monday, etc.). */
Calendar.prototype.setFirstDayOfWeek = function (firstDayOfWeek) {
	this._init(firstDayOfWeek, this.date);
	this._displayWeekdays();
};

/**
 *  Allows customization of what dates are enabled.  The "unaryFunction"
 *  parameter must be a function object that receives the date (as a JS Date
 *  object) and returns a boolean value.  If the returned value is true then
 *  the passed date will be marked as disabled.
 */
Calendar.prototype.setDateStatusHandler = Calendar.prototype.setDisabledHandler = function (unaryFunction) {
	this.getDateStatus = unaryFunction;
};

/** Customization of allowed year range for the calendar. */
Calendar.prototype.setRange = function (a, z) {
	this.minYear = a;
	this.maxYear = z;
};

/** Calls the first user handler (selectedHandler). */
Calendar.prototype.callHandler = function () {
	if (this.onSelected) {
		this.onSelected(this, this.date.print(this.dateFormat));
	}
};

/** Calls the second user handler (closeHandler). */
Calendar.prototype.callCloseHandler = function () {
	if (this.onClose) {
		this.onClose(this);
	}
	this.hideShowCovered();
};

/** Removes the calendar object from the DOM tree and destroys it. */
Calendar.prototype.destroy = function () {
	var el = this.element.parentNode;
	el.removeChild(this.element);
	Calendar._C = null;
	window._dynarch_popupCalendar = null;
};

/**
 *  Moves the calendar element to a different section in the DOM tree (changes
 *  its parent).
 */
Calendar.prototype.reparent = function (new_parent) {
	var el = this.element;
	el.parentNode.removeChild(el);
	new_parent.appendChild(el);
};

// This gets called when the user presses a mouse button anywhere in the
// document, if the calendar is shown.  If the click was outside the open
// calendar this function closes it.
Calendar._checkCalendar = function(ev) {
	var calendar = window._dynarch_popupCalendar;
	if (!calendar) {
		return false;
	}
	var el = Calendar.is_ie ? Calendar.getElement(ev) : Calendar.getTargetElement(ev);
	for (; el != null && el != calendar.element; el = el.parentNode);
	if (el == null) {
		// calls closeHandler which should hide the calendar.
		window._dynarch_popupCalendar.callCloseHandler();
		return Calendar.stopEvent(ev);
	}
};

/** Shows the calendar. */
Calendar.prototype.show = function () {
	var rows = this.table.getElementsByTagName("tr");
	for (var i = rows.length; i > 0;) {
		var row = rows[--i];
		Calendar.removeClass(row, "rowhilite");
		var cells = row.getElementsByTagName("td");
		for (var j = cells.length; j > 0;) {
			var cell = cells[--j];
			Calendar.removeClass(cell, "hilite");
			Calendar.removeClass(cell, "active");
		}
	}
	this.element.style.display = "block";
	this.hidden = false;
	if (this.isPopup) {
		window._dynarch_popupCalendar = this;
		Calendar.addEvent(document, "keydown", Calendar._keyEvent);
		Calendar.addEvent(document, "keypress", Calendar._keyEvent);
		Calendar.addEvent(document, "mousedown", Calendar._checkCalendar);
	}
	this.hideShowCovered();
};

/**
 *  Hides the calendar.  Also removes any "hilite" from the class of any TD
 *  element.
 */
Calendar.prototype.hide = function () {
	if (this.isPopup) {
		Calendar.removeEvent(document, "keydown", Calendar._keyEvent);
		Calendar.removeEvent(document, "keypress", Calendar._keyEvent);
		Calendar.removeEvent(document, "mousedown", Calendar._checkCalendar);
	}
	this.element.style.display = "none";
	this.hidden = true;
	this.hideShowCovered();
};

/**
 *  Shows the calendar at a given absolute position (beware that, depending on
 *  the calendar element style -- position property -- this might be relative
 *  to the parent's containing rectangle).
 */
Calendar.prototype.showAt = function (x, y) {
	var s = this.element.style;
	s.left = x + "px";
	s.top = y + "px";
	this.show();
};

/** Shows the calendar near a given element. */
Calendar.prototype.showAtElement = function (el, opts) {
	var self = this;
	var p = Calendar.getAbsolutePos(el);
	if (!opts || typeof opts != "string") {
		this.showAt(p.x, p.y + el.offsetHeight);
		return true;
	}
	function fixPosition(box) {
		if (box.x < 0)
			box.x = 0;
		if (box.y < 0)
			box.y = 0;
		var cp = document.createElement("div");
		var s = cp.style;
		s.position = "absolute";
		s.right = s.bottom = s.width = s.height = "0px";
		document.body.appendChild(cp);
		var br = Calendar.getAbsolutePos(cp);
		document.body.removeChild(cp);
		if (Calendar.is_ie) {
			br.y += document.body.scrollTop;
			br.x += document.body.scrollLeft;
		} else {
			br.y += window.scrollY;
			br.x += window.scrollX;
		}
		var tmp = box.x + box.width - br.x;
		if (tmp > 0) box.x -= tmp;
		tmp = box.y + box.height - br.y;
		if (tmp > 0) box.y -= tmp;
	};
	this.element.style.display = "block";
	Calendar.continuation_for_the_fucking_khtml_browser = function() {
		var w = self.element.offsetWidth;
		var h = self.element.offsetHeight;
		self.element.style.display = "none";
		var valign = opts.substr(0, 1);
		var halign = "l";
		if (opts.length > 1) {
			halign = opts.substr(1, 1);
		}
		// vertical alignment
		switch (valign) {
		    case "T": p.y -= h; break;
		    case "B": p.y += el.offsetHeight; break;
		    case "C": p.y += (el.offsetHeight - h) / 2; break;
		    case "t": p.y += el.offsetHeight - h; break;
		    case "b": break; // already there
		}
		// horizontal alignment
		switch (halign) {
		    case "L": p.x -= w; break;
		    case "R": p.x += el.offsetWidth; break;
		    case "C": p.x += (el.offsetWidth - w) / 2; break;
		    case "l": p.x += el.offsetWidth - w; break;
		    case "r": break; // already there
		}
		p.width = w;
		p.height = h + 40;
		self.monthsCombo.style.display = "none";
		fixPosition(p);
		self.showAt(p.x, p.y);
	};
	if (Calendar.is_khtml)
		setTimeout("Calendar.continuation_for_the_fucking_khtml_browser()", 10);
	else
		Calendar.continuation_for_the_fucking_khtml_browser();
};

/** Customizes the date format. */
Calendar.prototype.setDateFormat = function (str) {
	this.dateFormat = str;
};

/** Customizes the tooltip date format. */
Calendar.prototype.setTtDateFormat = function (str) {
	this.ttDateFormat = str;
};

/**
 *  Tries to identify the date represented in a string.  If successful it also
 *  calls this.setDate which moves the calendar to the given date.
 */
Calendar.prototype.parseDate = function(str, fmt) {
	if (!fmt)
		fmt = this.dateFormat;
	this.setDate(Date.parseDate(str, fmt));
};

Calendar.prototype.hideShowCovered = function () {
	if (!Calendar.is_ie && !Calendar.is_opera)
		return;
	function getVisib(obj){
		var value = obj.style.visibility;
		if (!value) {
			if (document.defaultView && typeof (document.defaultView.getComputedStyle) == "function") { // Gecko, W3C
				if (!Calendar.is_khtml)
					value = document.defaultView.
						getComputedStyle(obj, "").getPropertyValue("visibility");
				else
					value = '';
			} else if (obj.currentStyle) { // IE
				value = obj.currentStyle.visibility;
			} else
				value = '';
		}
		return value;
	};

	var tags = new Array("applet", "iframe", "select");
	var el = this.element;

	var p = Calendar.getAbsolutePos(el);
	var EX1 = p.x;
	var EX2 = el.offsetWidth + EX1;
	var EY1 = p.y;
	var EY2 = el.offsetHeight + EY1;

	for (var k = tags.length; k > 0; ) {
		var ar = document.getElementsByTagName(tags[--k]);
		var cc = null;

		for (var i = ar.length; i > 0;) {
			cc = ar[--i];

			p = Calendar.getAbsolutePos(cc);
			var CX1 = p.x;
			var CX2 = cc.offsetWidth + CX1;
			var CY1 = p.y;
			var CY2 = cc.offsetHeight + CY1;

			if (this.hidden || (CX1 > EX2) || (CX2 < EX1) || (CY1 > EY2) || (CY2 < EY1)) {
				if (!cc.__msh_save_visibility) {
					cc.__msh_save_visibility = getVisib(cc);
				}
				cc.style.visibility = cc.__msh_save_visibility;
			} else {
				if (!cc.__msh_save_visibility) {
					cc.__msh_save_visibility = getVisib(cc);
				}
				cc.style.visibility = "hidden";
			}
		}
	}
};

/** Internal function; it displays the bar with the names of the weekday. */
Calendar.prototype._displayWeekdays = function () {
	var fdow = this.firstDayOfWeek;
	var cell = this.firstdayname;
	var weekend = Calendar._TT["WEEKEND"];
	for (var i = 0; i < 7; ++i) {
		cell.className = "day name";
		var realday = (i + fdow) % 7;
		if (i) {
			cell.ttip = Calendar._TT["DAY_FIRST"].replace("%s", Calendar._DN[realday]);
			cell.navtype = 100;
			cell.calendar = this;
			cell.fdow = realday;
			Calendar._add_evs(cell);
		}
		if (weekend.indexOf(realday.toString()) != -1) {
			Calendar.addClass(cell, "weekend");
		}
		cell.innerHTML = Calendar._SDN[(i + fdow) % 7];
		cell = cell.nextSibling;
	}
};

/** Internal function.  Hides all combo boxes that might be displayed. */
Calendar.prototype._hideCombos = function () {
	this.monthsCombo.style.display = "none";
	this.yearsCombo.style.display = "none";
};

/** Internal function.  Starts dragging the element. */
Calendar.prototype._dragStart = function (ev) {
	if (this.dragging) {
		return;
	}
	this.dragging = true;
	var posX;
	var posY;
	if (Calendar.is_ie) {
		posY = window.event.clientY + document.body.scrollTop;
		posX = window.event.clientX + document.body.scrollLeft;
	} else {
		posY = ev.clientY + window.scrollY;
		posX = ev.clientX + window.scrollX;
	}
	var st = this.element.style;
	this.xOffs = posX - parseInt(st.left);
	this.yOffs = posY - parseInt(st.top);
	with (Calendar) {
		addEvent(document, "mousemove", calDragIt);
		addEvent(document, "mouseup", calDragEnd);
	}
};

// BEGIN: DATE OBJECT PATCHES

/** Adds the number of days array to the Date object. */
Date._MD = new Array(31,28,31,30,31,30,31,31,30,31,30,31);

/** Constants used for time computations */
Date.SECOND = 1000 /* milliseconds */;
Date.MINUTE = 60 * Date.SECOND;
Date.HOUR   = 60 * Date.MINUTE;
Date.DAY    = 24 * Date.HOUR;
Date.WEEK   =  7 * Date.DAY;

Date.parseDate = function(str, fmt) {
	var today = new Date();
	var y = 0;
	var m = -1;
	var d = 0;
	var a = str.split(/\W+/);
	var b = fmt.match(/%./g);
	var i = 0, j = 0;
	var hr = 0;
	var min = 0;
	for (i = 0; i < a.length; ++i) {
		if (!a[i])
			continue;
		switch (b[i]) {
		    case "%d":
		    case "%e":
			d = parseInt(a[i], 10);
			break;

		    case "%m":
			m = parseInt(a[i], 10) - 1;
			break;

		    case "%Y":
		    case "%y":
			y = parseInt(a[i], 10);
			(y < 100) && (y += (y > 29) ? 1900 : 2000);
			break;

		    case "%b":
		    case "%B":
			for (j = 0; j < 12; ++j) {
				if (Calendar._MN[j].substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) { m = j; break; }
			}
			break;

		    case "%H":
		    case "%I":
		    case "%k":
		    case "%l":
			hr = parseInt(a[i], 10);
			break;

		    case "%P":
		    case "%p":
			if (/pm/i.test(a[i]) && hr < 12)
				hr += 12;
			else if (/am/i.test(a[i]) && hr >= 12)
				hr -= 12;
			break;

		    case "%M":
			min = parseInt(a[i], 10);
			break;
		}
	}
	if (isNaN(y)) y = today.getFullYear();
	if (isNaN(m)) m = today.getMonth();
	if (isNaN(d)) d = today.getDate();
	if (isNaN(hr)) hr = today.getHours();
	if (isNaN(min)) min = today.getMinutes();
	if (y != 0 && m != -1 && d != 0)
		return new Date(y, m, d, hr, min, 0);
	y = 0; m = -1; d = 0;
	for (i = 0; i < a.length; ++i) {
		if (a[i].search(/[a-zA-Z]+/) != -1) {
			var t = -1;
			for (j = 0; j < 12; ++j) {
				if (Calendar._MN[j].substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) { t = j; break; }
			}
			if (t != -1) {
				if (m != -1) {
					d = m+1;
				}
				m = t;
			}
		} else if (parseInt(a[i], 10) <= 12 && m == -1) {
			m = a[i]-1;
		} else if (parseInt(a[i], 10) > 31 && y == 0) {
			y = parseInt(a[i], 10);
			(y < 100) && (y += (y > 29) ? 1900 : 2000);
		} else if (d == 0) {
			d = a[i];
		}
	}
	if (y == 0)
		y = today.getFullYear();
	if (m != -1 && d != 0)
		return new Date(y, m, d, hr, min, 0);
	return today;
};

/** Returns the number of days in the current month */
Date.prototype.getMonthDays = function(month) {
	var year = this.getFullYear();
	if (typeof month == "undefined") {
		month = this.getMonth();
	}
	if (((0 == (year%4)) && ( (0 != (year%100)) || (0 == (year%400)))) && month == 1) {
		return 29;
	} else {
		return Date._MD[month];
	}
};

/** Returns the number of day in the year. */
Date.prototype.getDayOfYear = function() {
	var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
	var time = now - then;
	return Math.floor(time / Date.DAY);
};

/** Returns the number of the week in year, as defined in ISO 8601. */
Date.prototype.getWeekNumber = function() {
	var d = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var DoW = d.getDay();
	d.setDate(d.getDate() - (DoW + 6) % 7 + 3); // Nearest Thu
	var ms = d.valueOf(); // GMT
	d.setMonth(0);
	d.setDate(4); // Thu in Week 1
	return Math.round((ms - d.valueOf()) / (7 * 864e5)) + 1;
};

/** Checks date and time equality */
Date.prototype.equalsTo = function(date) {
	return ((this.getFullYear() == date.getFullYear()) &&
		(this.getMonth() == date.getMonth()) &&
		(this.getDate() == date.getDate()) &&
		(this.getHours() == date.getHours()) &&
		(this.getMinutes() == date.getMinutes()));
};

/** Set only the year, month, date parts (keep existing time) */
Date.prototype.setDateOnly = function(date) {
	var tmp = new Date(date);
	this.setDate(1);
	this.setFullYear(tmp.getFullYear());
	this.setMonth(tmp.getMonth());
	this.setDate(tmp.getDate());
};

/** Prints the date in a string according to the given format. */
Date.prototype.print = function (str) {
	var m = this.getMonth();
	var d = this.getDate();
	var y = this.getFullYear();
	var wn = this.getWeekNumber();
	var w = this.getDay();
	var s = {};
	var hr = this.getHours();
	var pm = (hr >= 12);
	var ir = (pm) ? (hr - 12) : hr;
	var dy = this.getDayOfYear();
	if (ir == 0)
		ir = 12;
	var min = this.getMinutes();
	var sec = this.getSeconds();
	s["%a"] = Calendar._SDN[w]; // abbreviated weekday name [FIXME: I18N]
	s["%A"] = Calendar._DN[w]; // full weekday name
	s["%b"] = Calendar._SMN[m]; // abbreviated month name [FIXME: I18N]
	s["%B"] = Calendar._MN[m]; // full month name
	// FIXME: %c : preferred date and time representation for the current locale
	s["%C"] = 1 + Math.floor(y / 100); // the century number
	s["%d"] = (d < 10) ? ("0" + d) : d; // the day of the month (range 01 to 31)
	s["%e"] = d; // the day of the month (range 1 to 31)
	// FIXME: %D : american date style: %m/%d/%y
	// FIXME: %E, %F, %G, %g, %h (man strftime)
	s["%H"] = (hr < 10) ? ("0" + hr) : hr; // hour, range 00 to 23 (24h format)
	s["%I"] = (ir < 10) ? ("0" + ir) : ir; // hour, range 01 to 12 (12h format)
	s["%j"] = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy; // day of the year (range 001 to 366)
	s["%k"] = hr;		// hour, range 0 to 23 (24h format)
	s["%l"] = ir;		// hour, range 1 to 12 (12h format)
	s["%m"] = (m < 9) ? ("0" + (1+m)) : (1+m); // month, range 01 to 12
	s["%M"] = (min < 10) ? ("0" + min) : min; // minute, range 00 to 59
	s["%n"] = "\n";		// a newline character
	s["%p"] = pm ? "PM" : "AM";
	s["%P"] = pm ? "pm" : "am";
	// FIXME: %r : the time in am/pm notation %I:%M:%S %p
	// FIXME: %R : the time in 24-hour notation %H:%M
	s["%s"] = Math.floor(this.getTime() / 1000);
	s["%S"] = (sec < 10) ? ("0" + sec) : sec; // seconds, range 00 to 59
	s["%t"] = "\t";		// a tab character
	// FIXME: %T : the time in 24-hour notation (%H:%M:%S)
	s["%U"] = s["%W"] = s["%V"] = (wn < 10) ? ("0" + wn) : wn;
	s["%u"] = w + 1;	// the day of the week (range 1 to 7, 1 = MON)
	s["%w"] = w;		// the day of the week (range 0 to 6, 0 = SUN)
	// FIXME: %x : preferred date representation for the current locale without the time
	// FIXME: %X : preferred time representation for the current locale without the date
	s["%y"] = ('' + y).substr(2, 2); // year without the century (range 00 to 99)
	s["%Y"] = y;		// year with the century
	s["%%"] = "%";		// a literal '%' character

	var re = /%./g;
	if (!Calendar.is_ie5 && !Calendar.is_khtml)
		return str.replace(re, function (par) { return s[par] || par; });

	var a = str.match(re);
	for (var i = 0; i < a.length; i++) {
		var tmp = s[a[i]];
		if (tmp) {
			re = new RegExp(a[i], 'g');
			str = str.replace(re, tmp);
		}
	}

	return str;
};

Date.prototype.__msh_oldSetFullYear = Date.prototype.setFullYear;
Date.prototype.setFullYear = function(y) {
	var d = new Date(this);
	d.__msh_oldSetFullYear(y);
	if (d.getMonth() != this.getMonth())
		this.setDate(28);
	this.__msh_oldSetFullYear(y);
};

// END: DATE OBJECT PATCHES


// global object that remembers the calendar
window._dynarch_popupCalendar = null;

/*  Copyright Mihai Bazon, 2002, 2003  |  http://dynarch.com/mishoo/
 * ---------------------------------------------------------------------------
 *
 * The DHTML Calendar
 *
 * Details and latest version at:
 * http://dynarch.com/mishoo/calendar.epl
 *
 * This script is distributed under the GNU Lesser General Public License.
 * Read the entire license text here: http://www.gnu.org/licenses/lgpl.html
 *
 * This file defines helper functions for setting up the calendar.  They are
 * intended to help non-programmers get a working calendar on their site
 * quickly.  This script should not be seen as part of the calendar.  It just
 * shows you what one can do with the calendar, while in the same time
 * providing a quick and simple method for setting it up.  If you need
 * exhaustive customization of the calendar creation process feel free to
 * modify this code to suit your needs (this is recommended and much better
 * than modifying calendar.js itself).
 */

// $Id: calendar-setup.js,v 1.26 2006/02/11 12:32:59 mishoo Exp $

/**
 *  This function "patches" an input field (or other element) to use a calendar
 *  widget for date selection.
 *
 *  The "params" is a single object that can have the following properties:
 *
 *    prop. name   | description
 *  -------------------------------------------------------------------------------------------------
 *   inputField    | the ID of an input field to store the date
 *   displayArea   | the ID of a DIV or other element to show the date
 *   button        | ID of a button or other element that will trigger the calendar
 *   eventName     | event that will trigger the calendar, without the "on" prefix (default: "click")
 *   ifFormat      | date format that will be stored in the input field
 *   daFormat      | the date format that will be used to display the date in displayArea
 *   singleClick   | (true/false) wether the calendar is in single click mode or not (default: true)
 *   firstDay      | numeric: 0 to 6.  "0" means display Sunday first, "1" means display Monday first, etc.
 *   align         | alignment (default: "Br"); if you don't know what's this see the calendar documentation
 *   range         | array with 2 elements.  Default: [1900, 2999] -- the range of years available
 *   weekNumbers   | (true/false) if it's true (default) the calendar will display week numbers
 *   flat          | null or element ID; if not null the calendar will be a flat calendar having the parent with the given ID
 *   flatCallback  | function that receives a JS Date object and returns an URL to point the browser to (for flat calendar)
 *   disableFunc   | function that receives a JS Date object and should return true if that date has to be disabled in the calendar
 *   onSelect      | function that gets called when a date is selected.  You don't _have_ to supply this (the default is generally okay)
 *   onClose       | function that gets called when the calendar is closed.  [default]
 *   onUpdate      | function that gets called after the date is updated in the input field.  Receives a reference to the calendar.
 *   date          | the date that the calendar will be initially displayed to
 *   showsTime     | default: false; if true the calendar will include a time selector
 *   timeFormat    | the time format; can be "12" or "24", default is "12"
 *   electric      | if true (default) then given fields/date areas are updated for each move; otherwise they're updated only on close
 *   step          | configures the step of the years in drop-down boxes; default: 2
 *   position      | configures the calendar absolute position; default: null
 *   cache         | if "true" (but default: "false") it will reuse the same calendar object, where possible
 *   showOthers    | if "true" (but default: "false") it will show days from other months too
 *
 *  None of them is required, they all have default values.  However, if you
 *  pass none of "inputField", "displayArea" or "button" you'll get a warning
 *  saying "nothing to setup".
 */
Calendar.setup = function (params) {
	function param_default(pname, def) { if (typeof params[pname] == "undefined") { params[pname] = def; } };

	param_default("inputField",      null);
	param_default("displayArea",     null);
	param_default("button",          null);
	param_default("eventName",       "click");
	param_default("ifFormat",        "%Y/%m/%d");
	param_default("daFormat",        "%Y/%m/%d");
	param_default("singleClick",     true);
	param_default("disableFunc",     null);
	param_default("dateStatusFunc",  params["disableFunc"]);	// takes precedence if both are defined
	param_default("dateTooltipFunc", null);
	param_default("dateText",        null);
	param_default("firstDay",        null);
	param_default("align",           "Br");
	param_default("range",           [1900, 2999]);
	param_default("weekNumbers",     true);
	param_default("flat",            null);
	param_default("flatCallback",    null);
	param_default("onSelect",        null);
	param_default("onClose",         null);
	param_default("onUpdate",        null);
	param_default("date",            null);
	param_default("showsTime",       false);
	param_default("timeFormat",      "24");
	param_default("electric",        true);
	param_default("step",            2);
	param_default("position",        null);
	param_default("cache",           false);
	param_default("showOthers",      false);
	param_default("multiple",        null);

	var tmp = ["inputField", "displayArea", "button"];
	for (var i in tmp) {
		if (typeof params[tmp[i]] == "string") {
			params[tmp[i]] = document.getElementById(params[tmp[i]]);
		}
	}
	if (!(params.flat || params.multiple || params.inputField || params.displayArea || params.button)) {
		alert("Calendar.setup:\n  Nothing to setup (no fields found).  Please check your code");
		return false;
	}

	function onSelect(cal) {
		var p = cal.params;
		var update = (cal.dateClicked || p.electric);
		if (update && p.inputField) {
			p.inputField.value = cal.date.print(p.ifFormat);
			if (typeof p.inputField.onchange == "function")
				p.inputField.onchange();
		}
		if (update && p.displayArea)
			p.displayArea.innerHTML = cal.date.print(p.daFormat);
		if (update && typeof p.onUpdate == "function")
			p.onUpdate(cal);
		if (update && p.flat) {
			if (typeof p.flatCallback == "function")
				p.flatCallback(cal);
		}
		if (update && p.singleClick && cal.dateClicked)
			cal.callCloseHandler();
	};

	if (params.flat != null) {
		if (typeof params.flat == "string")
			params.flat = document.getElementById(params.flat);
		if (!params.flat) {
			alert("Calendar.setup:\n  Flat specified but can't find parent.");
			return false;
		}
		var cal = new Calendar(params.firstDay, params.date, params.onSelect || onSelect);
		cal.setDateToolTipHandler(params.dateTooltipFunc);
		cal.showsOtherMonths = params.showOthers;
		cal.showsTime = params.showsTime;
		cal.time24 = (params.timeFormat == "24");
		cal.params = params;
		cal.weekNumbers = params.weekNumbers;
		cal.setRange(params.range[0], params.range[1]);
		cal.setDateStatusHandler(params.dateStatusFunc);
		cal.getDateText = params.dateText;
		if (params.ifFormat) {
			cal.setDateFormat(params.ifFormat);
		}
		if (params.inputField && typeof params.inputField.value == "string") {
			cal.parseDate(params.inputField.value);
		}
		cal.create(params.flat);
		cal.show();
		return false;
	}

	var triggerEl = params.button || params.displayArea || params.inputField;
	triggerEl["on" + params.eventName] = function() {
		var dateEl = params.inputField || params.displayArea;
		var dateFmt = params.inputField ? params.ifFormat : params.daFormat;
		var mustCreate = false;
		var cal = window.calendar;
		if (dateEl)
			params.date = Date.parseDate(dateEl.value || dateEl.innerHTML, dateFmt);
		if (!(cal && params.cache)) {
			window.calendar = cal = new Calendar(params.firstDay,
							     params.date,
							     params.onSelect || onSelect,
							     params.onClose || function(cal) { cal.hide(); });
			cal.setDateToolTipHandler(params.dateTooltipFunc);
			cal.showsTime = params.showsTime;
			cal.time24 = (params.timeFormat == "24");
			cal.weekNumbers = params.weekNumbers;
			mustCreate = true;
		} else {
			if (params.date)
				cal.setDate(params.date);
			cal.hide();
		}
		if (params.multiple) {
			cal.multiple = {};
			for (var i = params.multiple.length; --i >= 0;) {
				var d = params.multiple[i];
				var ds = d.print("%Y%m%d");
				cal.multiple[ds] = d;
			}
		}
		cal.showsOtherMonths = params.showOthers;
		cal.yearStep = params.step;
		cal.setRange(params.range[0], params.range[1]);
		cal.params = params;
		cal.setDateStatusHandler(params.dateStatusFunc);
		cal.getDateText = params.dateText;
		cal.setDateFormat(dateFmt);
		if (mustCreate)
			cal.create();
		cal.refresh();
		if (!params.position)
			cal.showAtElement(params.button || params.displayArea || params.inputField, params.align);
		else
			cal.showAt(params.position[0], params.position[1]);
		return false;
	};

	return cal;
};

// ** I18N

// Calendar EN language
// Author: Mihai Bazon, <mihai_bazon@yahoo.com>
// Encoding: any
// Distributed under the same terms as the calendar itself.

// For translators: please use UTF-8 if possible.  We strongly believe that
// Unicode is the answer to a real internationalized world.  Also please
// include your contact information in the header, as can be seen above.

// full day names
Calendar._DN = new Array
("Sunday",
 "Monday",
 "Tuesday",
 "Wednesday",
 "Thursday",
 "Friday",
 "Saturday",
 "Sunday");

// Please note that the following array of short day names (and the same goes
// for short month names, _SMN) isn't absolutely necessary.  We give it here
// for exemplification on how one can customize the short day names, but if
// they are simply the first N letters of the full name you can simply say:
//
//   Calendar._SDN_len = N; // short day name length
//   Calendar._SMN_len = N; // short month name length
//
// If N = 3 then this is not needed either since we assume a value of 3 if not
// present, to be compatible with translation files that were written before
// this feature.

// short day names
Calendar._SDN = new Array
("Sun",
 "Mon",
 "Tue",
 "Wed",
 "Thu",
 "Fri",
 "Sat",
 "Sun");

// First day of the week. "0" means display Sunday first, "1" means display
// Monday first, etc.
Calendar._FD = 0;

// full month names
Calendar._MN = new Array
("January",
 "February",
 "March",
 "April",
 "May",
 "June",
 "July",
 "August",
 "September",
 "October",
 "November",
 "December");

// short month names
Calendar._SMN = new Array
("Jan",
 "Feb",
 "Mar",
 "Apr",
 "May",
 "Jun",
 "Jul",
 "Aug",
 "Sep",
 "Oct",
 "Nov",
 "Dec");

// tooltips
Calendar._TT = {};
Calendar._TT["INFO"] = "About the calendar";

Calendar._TT["ABOUT"] =
"DHTML Date/Time Selector\n" +
"(c) dynarch.com 2002-2005 / Author: Mihai Bazon\n" + // don't translate this this ;-)
"For latest version visit: http://www.dynarch.com/projects/calendar/\n" +
"Distributed under GNU LGPL.  See http://gnu.org/licenses/lgpl.html for details." +
"\n\n" +
"Date selection:\n" +
"- Use the \xab, \xbb buttons to select year\n" +
"- Use the " + String.fromCharCode(0x2039) + ", " + String.fromCharCode(0x203a) + " buttons to select month\n" +
"- Hold mouse button on any of the above buttons for faster selection.";
Calendar._TT["ABOUT_TIME"] = "\n\n" +
"Time selection:\n" +
"- Click on any of the time parts to increase it\n" +
"- or Shift-click to decrease it\n" +
"- or click and drag for faster selection.";

Calendar._TT["PREV_YEAR"] = "Prev. year (hold for menu)";
Calendar._TT["PREV_MONTH"] = "Prev. month (hold for menu)";
Calendar._TT["GO_TODAY"] = "Go Today";
Calendar._TT["NEXT_MONTH"] = "Next month (hold for menu)";
Calendar._TT["NEXT_YEAR"] = "Next year (hold for menu)";
Calendar._TT["SEL_DATE"] = "Select date";
Calendar._TT["DRAG_TO_MOVE"] = "Drag to move";
Calendar._TT["PART_TODAY"] = " (today)";

// the following is to inform that "%s" is to be the first day of week
// %s will be replaced with the day name.
Calendar._TT["DAY_FIRST"] = "Display %s first";

// This may be locale-dependent.  It specifies the week-end days, as an array
// of comma-separated numbers.  The numbers are from 0 to 6: 0 means Sunday, 1
// means Monday, etc.
Calendar._TT["WEEKEND"] = "0,6";

Calendar._TT["CLOSE"] = "Close";
Calendar._TT["TODAY"] = "Today";
Calendar._TT["TIME_PART"] = "(Shift-)Click or drag to change value";

// date formats
Calendar._TT["DEF_DATE_FORMAT"] = "%Y-%m-%d";
Calendar._TT["TT_DATE_FORMAT"] = "%a, %b %e";

Calendar._TT["WK"] = "wk";
Calendar._TT["TIME"] = "Time:";


/**
 * jscolor, JavaScript Color Picker
 *
 * @version 1.3.1
 * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html
 * @author  Jan Odvarko, http://odvarko.cz
 * @created 2008-06-15
 * @updated 2010-01-23
 * @link    http://jscolor.com
 */


var jscolor = {


	dir : '', // location of jscolor directory (leave empty to autodetect)
	bindClass : 'color', // class name
	binding : true, // automatic binding via <input class="...">
	preloading : true, // use image preloading?


	install : function() {
		jscolor.addEvent(window, 'load', jscolor.init);
	},


	init : function() {
		if(jscolor.binding) {
			jscolor.bind();
		}
		if(jscolor.preloading) {
			jscolor.preload();
		}
	},


	getDir : function() {
		if(!jscolor.dir) {
			var detected = jscolor.detectDir();
			jscolor.dir = detected!==false ? detected : 'jscolor/';
		}
		return jscolor.dir;
	},


	detectDir : function() {
		var base = location.href;

		var e = document.getElementsByTagName('base');
		for(var i=0; i<e.length; i+=1) {
			if(e[i].href) { base = e[i].href; }
		}

		var e = document.getElementsByTagName('script');
		for(var i=0; i<e.length; i+=1) {
			if(e[i].src && /(^|\/)jscolor\.js([?#].*)?$/i.test(e[i].src)) {
				var src = new jscolor.URI(e[i].src);
				var srcAbs = src.toAbsolute(base);
				srcAbs.path = srcAbs.path.replace(/[^\/]+$/, ''); // remove filename
				srcAbs.query = null;
				srcAbs.fragment = null;
				return srcAbs.toString();
			}
		}
		return false;
	},


	bind : function() {
		var matchClass = new RegExp('(^|\\s)('+jscolor.bindClass+')\\s*(\\{[^}]*\\})?', 'i');
		var e = document.getElementsByTagName('input');
		for(var i=0; i<e.length; i+=1) {
			var m;
			if(!e[i].color && e[i].className && (m = e[i].className.match(matchClass))) {
				var prop = {};
				if(m[3]) {
					try {
						eval('prop='+m[3]);
					} catch(eInvalidProp) {}
				}
				e[i].color = new jscolor.color(e[i], prop);
			}
		}
	},


	preload : function() {
		for(var fn in jscolor.imgRequire) {
			if(jscolor.imgRequire.hasOwnProperty(fn)) {
				jscolor.loadImage(fn);
			}
		}
	},


	images : {
		pad : [ 181, 101 ],
		sld : [ 16, 101 ],
		cross : [ 15, 15 ],
		arrow : [ 7, 11 ]
	},


	imgRequire : {},
	imgLoaded : {},


	requireImage : function(filename) {
		jscolor.imgRequire[filename] = true;
	},


	loadImage : function(filename) {
		if(!jscolor.imgLoaded[filename]) {
			jscolor.imgLoaded[filename] = new Image();
			jscolor.imgLoaded[filename].src = jscolor.getDir()+filename;
		}
	},


	fetchElement : function(mixed) {
		return typeof mixed === 'string' ? document.getElementById(mixed) : mixed;
	},


	addEvent : function(el, evnt, func) {
		if(el.addEventListener) {
			el.addEventListener(evnt, func, false);
		} else if(el.attachEvent) {
			el.attachEvent('on'+evnt, func);
		}
	},


	fireEvent : function(el, evnt) {
		if(!el) {
			return;
		}
		if(document.createEventObject) {
			var ev = document.createEventObject();
			el.fireEvent('on'+evnt, ev);
		} else if(document.createEvent) {
			var ev = document.createEvent('HTMLEvents');
			ev.initEvent(evnt, true, true);
			el.dispatchEvent(ev);
		} else if(el['on'+evnt]) { // alternatively use the traditional event model (IE5)
			el['on'+evnt]();
		}
	},


	getElementPos : function(e) {
		var e1=e, e2=e;
		var x=0, y=0;
		if(e1.offsetParent) {
			do {
				x += e1.offsetLeft;
				y += e1.offsetTop;
			} while(e1 = e1.offsetParent);
		}
		while((e2 = e2.parentNode) && e2.nodeName.toUpperCase() !== 'BODY') {
			x -= e2.scrollLeft;
			y -= e2.scrollTop;
		}
		return [x, y];
	},


	getElementSize : function(e) {
		return [e.offsetWidth, e.offsetHeight];
	},


	getMousePos : function(e) {
		if(!e) { e = window.event; }
		if(typeof e.pageX === 'number') {
			return [e.pageX, e.pageY];
		} else if(typeof e.clientX === 'number') {
			return [
				e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
				e.clientY + document.body.scrollTop + document.documentElement.scrollTop
			];
		}
	},


	getViewPos : function() {
		if(typeof window.pageYOffset === 'number') {
			return [window.pageXOffset, window.pageYOffset];
		} else if(document.body && (document.body.scrollLeft || document.body.scrollTop)) {
			return [document.body.scrollLeft, document.body.scrollTop];
		} else if(document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
			return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
		} else {
			return [0, 0];
		}
	},


	getViewSize : function() {
		if(typeof window.innerWidth === 'number') {
			return [window.innerWidth, window.innerHeight];
		} else if(document.body && (document.body.clientWidth || document.body.clientHeight)) {
			return [document.body.clientWidth, document.body.clientHeight];
		} else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
			return [document.documentElement.clientWidth, document.documentElement.clientHeight];
		} else {
			return [0, 0];
		}
	},


	URI : function(uri) { // See RFC3986

		this.scheme = null;
		this.authority = null;
		this.path = '';
		this.query = null;
		this.fragment = null;

		this.parse = function(uri) {
			var m = uri.match(/^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/);
			this.scheme = m[3] ? m[2] : null;
			this.authority = m[5] ? m[6] : null;
			this.path = m[7];
			this.query = m[9] ? m[10] : null;
			this.fragment = m[12] ? m[13] : null;
			return this;
		};

		this.toString = function() {
			var result = '';
			if(this.scheme !== null) { result = result + this.scheme + ':'; }
			if(this.authority !== null) { result = result + '//' + this.authority; }
			if(this.path !== null) { result = result + this.path; }
			if(this.query !== null) { result = result + '?' + this.query; }
			if(this.fragment !== null) { result = result + '#' + this.fragment; }
			return result;
		};

		this.toAbsolute = function(base) {
			var base = new jscolor.URI(base);
			var r = this;
			var t = new jscolor.URI;

			if(base.scheme === null) { return false; }

			if(r.scheme !== null && r.scheme.toLowerCase() === base.scheme.toLowerCase()) {
				r.scheme = null;
			}

			if(r.scheme !== null) {
				t.scheme = r.scheme;
				t.authority = r.authority;
				t.path = removeDotSegments(r.path);
				t.query = r.query;
			} else {
				if(r.authority !== null) {
					t.authority = r.authority;
					t.path = removeDotSegments(r.path);
					t.query = r.query;
				} else {
					if(r.path === '') { // TODO: == or === ?
						t.path = base.path;
						if(r.query !== null) {
							t.query = r.query;
						} else {
							t.query = base.query;
						}
					} else {
						if(r.path.substr(0,1) === '/') {
							t.path = removeDotSegments(r.path);
						} else {
							if(base.authority !== null && base.path === '') { // TODO: == or === ?
								t.path = '/'+r.path;
							} else {
								t.path = base.path.replace(/[^\/]+$/,'')+r.path;
							}
							t.path = removeDotSegments(t.path);
						}
						t.query = r.query;
					}
					t.authority = base.authority;
				}
				t.scheme = base.scheme;
			}
			t.fragment = r.fragment;

			return t;
		};

		function removeDotSegments(path) {
			var out = '';
			while(path) {
				if(path.substr(0,3)==='../' || path.substr(0,2)==='./') {
					path = path.replace(/^\.+/,'').substr(1);
				} else if(path.substr(0,3)==='/./' || path==='/.') {
					path = '/'+path.substr(3);
				} else if(path.substr(0,4)==='/../' || path==='/..') {
					path = '/'+path.substr(4);
					out = out.replace(/\/?[^\/]*$/, '');
				} else if(path==='.' || path==='..') {
					path = '';
				} else {
					var rm = path.match(/^\/?[^\/]*/)[0];
					path = path.substr(rm.length);
					out = out + rm;
				}
			}
			return out;
		}

		if(uri) {
			this.parse(uri);
		}

	},


	/*
	 * Usage example:
	 * var myColor = new jscolor.color(myInputElement)
	 */

	color : function(target, prop) {


		this.required = true; // refuse empty values?
		this.adjust = true; // adjust value to uniform notation?
		this.hash = false; // prefix color with # symbol?
		this.caps = true; // uppercase?
		this.valueElement = target; // value holder
		this.styleElement = target; // where to reflect current color
		this.hsv = [0, 0, 1]; // read-only  0-6, 0-1, 0-1
		this.rgb = [1, 1, 1]; // read-only  0-1, 0-1, 0-1

		this.pickerOnfocus = true; // display picker on focus?
		this.pickerMode = 'HSV'; // HSV | HVS
		this.pickerPosition = 'bottom'; // left | right | top | bottom
		this.pickerFace = 10; // px
		this.pickerFaceColor = 'ThreeDFace'; // CSS color
		this.pickerBorder = 1; // px
		this.pickerBorderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // CSS color
		this.pickerInset = 1; // px
		this.pickerInsetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // CSS color
		this.pickerZIndex = 10000;


		for(var p in prop) {
			if(prop.hasOwnProperty(p)) {
				this[p] = prop[p];
			}
		}


		this.hidePicker = function() {
			if(isPickerOwner()) {
				removePicker();
			}
		};


		this.showPicker = function() {
			if(!isPickerOwner()) {
				var tp = jscolor.getElementPos(target); // target pos
				var ts = jscolor.getElementSize(target); // target size
				var vp = jscolor.getViewPos(); // view pos
				var vs = jscolor.getViewSize(); // view size
				var ps = [ // picker size
					2*this.pickerBorder + 4*this.pickerInset + 2*this.pickerFace + jscolor.images.pad[0] + 2*jscolor.images.arrow[0] + jscolor.images.sld[0],
					2*this.pickerBorder + 2*this.pickerInset + 2*this.pickerFace + jscolor.images.pad[1]
				];
				var a, b, c;
				switch(this.pickerPosition.toLowerCase()) {
					case 'left': a=1; b=0; c=-1; break;
					case 'right':a=1; b=0; c=1; break;
					case 'top':  a=0; b=1; c=-1; break;
					default:     a=0; b=1; c=1; break;
				}
				var l = (ts[b]+ps[b])/2;
				var pp = [ // picker pos
					-vp[a]+tp[a]+ps[a] > vs[a] ?
						(-vp[a]+tp[a]+ts[a]/2 > vs[a]/2 && tp[a]+ts[a]-ps[a] >= 0 ? tp[a]+ts[a]-ps[a] : tp[a]) :
						tp[a],
					-vp[b]+tp[b]+ts[b]+ps[b]-l+l*c > vs[b] ?
						(-vp[b]+tp[b]+ts[b]/2 > vs[b]/2 && tp[b]+ts[b]-l-l*c >= 0 ? tp[b]+ts[b]-l-l*c : tp[b]+ts[b]-l+l*c) :
						(tp[b]+ts[b]-l+l*c >= 0 ? tp[b]+ts[b]-l+l*c : tp[b]+ts[b]-l-l*c)
				];
				drawPicker(pp[a], pp[b]);
			}
		};


		this.importColor = function() {
			if(!valueElement) {
				this.exportColor();
			} else {
				if(!this.adjust) {
					if(!this.fromString(valueElement.value, leaveValue)) {
						styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
						styleElement.style.color = styleElement.jscStyle.color;
						this.exportColor(leaveValue | leaveStyle);
					}
				} else if(!this.required && /^\s*$/.test(valueElement.value)) {
					valueElement.value = '';
					styleElement.style.backgroundColor = styleElement.jscStyle.backgroundColor;
					styleElement.style.color = styleElement.jscStyle.color;
					this.exportColor(leaveValue | leaveStyle);

				} else if(this.fromString(valueElement.value)) {
					// OK
				} else {
					this.exportColor();
				}
			}
		};


		this.exportColor = function(flags) {
			if(!(flags & leaveValue) && valueElement) {
				var value = this.toString();
				if(this.caps) { value = value.toUpperCase(); }
				if(this.hash) { value = '#'+value; }
				valueElement.value = value;
			}
			if(!(flags & leaveStyle) && styleElement) {
				styleElement.style.backgroundColor =
					'#'+this.toString();
				styleElement.style.color =
					0.213 * this.rgb[0] +
					0.715 * this.rgb[1] +
					0.072 * this.rgb[2]
					< 0.5 ? '#FFF' : '#000';
			}
			if(!(flags & leavePad) && isPickerOwner()) {
				redrawPad();
			}
			if(!(flags & leaveSld) && isPickerOwner()) {
				redrawSld();
			}
		};


		this.fromHSV = function(h, s, v, flags) { // null = don't change
			h<0 && (h=0) || h>6 && (h=6);
			s<0 && (s=0) || s>1 && (s=1);
			v<0 && (v=0) || v>1 && (v=1);
			this.rgb = HSV_RGB(
				h===null ? this.hsv[0] : (this.hsv[0]=h),
				s===null ? this.hsv[1] : (this.hsv[1]=s),
				v===null ? this.hsv[2] : (this.hsv[2]=v)
			);
			this.exportColor(flags);
		};


		this.fromRGB = function(r, g, b, flags) { // null = don't change
			r<0 && (r=0) || r>1 && (r=1);
			g<0 && (g=0) || g>1 && (g=1);
			b<0 && (b=0) || b>1 && (b=1);
			var hsv = RGB_HSV(
				r===null ? this.rgb[0] : (this.rgb[0]=r),
				g===null ? this.rgb[1] : (this.rgb[1]=g),
				b===null ? this.rgb[2] : (this.rgb[2]=b)
			);
			if(hsv[0] !== null) {
				this.hsv[0] = hsv[0];
			}
			if(hsv[2] !== 0) {
				this.hsv[1] = hsv[1];
			}
			this.hsv[2] = hsv[2];
			this.exportColor(flags);
		};


		this.fromString = function(hex, flags) {
			var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
			if(!m) {
				return false;
			} else {
				if(m[1].length === 6) { // 6-char notation
					this.fromRGB(
						parseInt(m[1].substr(0,2),16) / 255,
						parseInt(m[1].substr(2,2),16) / 255,
						parseInt(m[1].substr(4,2),16) / 255,
						flags
					);
				} else { // 3-char notation
					this.fromRGB(
						parseInt(m[1].charAt(0)+m[1].charAt(0),16) / 255,
						parseInt(m[1].charAt(1)+m[1].charAt(1),16) / 255,
						parseInt(m[1].charAt(2)+m[1].charAt(2),16) / 255,
						flags
					);
				}
				return true;
			}
		};


		this.toString = function() {
			return (
				(0x100 | Math.round(255*this.rgb[0])).toString(16).substr(1) +
				(0x100 | Math.round(255*this.rgb[1])).toString(16).substr(1) +
				(0x100 | Math.round(255*this.rgb[2])).toString(16).substr(1)
			);
		};


		function RGB_HSV(r, g, b) {
			var n = Math.min(Math.min(r,g),b);
			var v = Math.max(Math.max(r,g),b);
			var m = v - n;
			if(m === 0) { return [ null, 0, v ]; }
			var h = r===n ? 3+(b-g)/m : (g===n ? 5+(r-b)/m : 1+(g-r)/m);
			return [ h===6?0:h, m/v, v ];
		}


		function HSV_RGB(h, s, v) {
			if(h === null) { return [ v, v, v ]; }
			var i = Math.floor(h);
			var f = i%2 ? h-i : 1-(h-i);
			var m = v * (1 - s);
			var n = v * (1 - s*f);
			switch(i) {
				case 6:
				case 0: return [v,n,m];
				case 1: return [n,v,m];
				case 2: return [m,v,n];
				case 3: return [m,n,v];
				case 4: return [n,m,v];
				case 5: return [v,m,n];
			}
		}


		function removePicker() {
			delete jscolor.picker.owner;
			document.getElementsByTagName('body')[0].removeChild(jscolor.picker.boxB);
		}


		function drawPicker(x, y) {
			if(!jscolor.picker) {
				jscolor.picker = {
					box : document.createElement('div'),
					boxB : document.createElement('div'),
					pad : document.createElement('div'),
					padB : document.createElement('div'),
					padM : document.createElement('div'),
					sld : document.createElement('div'),
					sldB : document.createElement('div'),
					sldM : document.createElement('div')
				};
				for(var i=0,segSize=4; i<jscolor.images.sld[1]; i+=segSize) {
					var seg = document.createElement('div');
					seg.style.height = segSize+'px';
					seg.style.fontSize = '1px';
					seg.style.lineHeight = '0';
					jscolor.picker.sld.appendChild(seg);
				}
				jscolor.picker.sldB.appendChild(jscolor.picker.sld);
				jscolor.picker.box.appendChild(jscolor.picker.sldB);
				jscolor.picker.box.appendChild(jscolor.picker.sldM);
				jscolor.picker.padB.appendChild(jscolor.picker.pad);
				jscolor.picker.box.appendChild(jscolor.picker.padB);
				jscolor.picker.box.appendChild(jscolor.picker.padM);
				jscolor.picker.boxB.appendChild(jscolor.picker.box);
			}

			var p = jscolor.picker;

			// recompute controls positions
			posPad = [
				x+THIS.pickerBorder+THIS.pickerFace+THIS.pickerInset,
				y+THIS.pickerBorder+THIS.pickerFace+THIS.pickerInset ];
			posSld = [
				null,
				y+THIS.pickerBorder+THIS.pickerFace+THIS.pickerInset ];

			// controls interaction
			p.box.onmouseup =
			p.box.onmouseout = function() { target.focus(); };
			p.box.onmousedown = function() { abortBlur=true; };
			p.box.onmousemove = function(e) { holdPad && setPad(e); holdSld && setSld(e); };
			p.padM.onmouseup =
			p.padM.onmouseout = function() { if(holdPad) { holdPad=false; jscolor.fireEvent(valueElement,'change'); } };
			p.padM.onmousedown = function(e) { holdPad=true; setPad(e); };
			p.sldM.onmouseup =
			p.sldM.onmouseout = function() { if(holdSld) { holdSld=false; jscolor.fireEvent(valueElement,'change'); } };
			p.sldM.onmousedown = function(e) { holdSld=true; setSld(e); };

			// picker
			p.box.style.width = 4*THIS.pickerInset + 2*THIS.pickerFace + jscolor.images.pad[0] + 2*jscolor.images.arrow[0] + jscolor.images.sld[0] + 'px';
			p.box.style.height = 2*THIS.pickerInset + 2*THIS.pickerFace + jscolor.images.pad[1] + 'px';

			// picker border
			p.boxB.style.position = 'absolute';
			p.boxB.style.clear = 'both';
			p.boxB.style.left = x+'px';
			p.boxB.style.top = y+'px';
			p.boxB.style.zIndex = THIS.pickerZIndex;
			p.boxB.style.border = THIS.pickerBorder+'px solid';
			p.boxB.style.borderColor = THIS.pickerBorderColor;
			p.boxB.style.background = THIS.pickerFaceColor;

			// pad image
			p.pad.style.width = jscolor.images.pad[0]+'px';
			p.pad.style.height = jscolor.images.pad[1]+'px';

			// pad border
			p.padB.style.position = 'absolute';
			p.padB.style.left = THIS.pickerFace+'px';
			p.padB.style.top = THIS.pickerFace+'px';
			p.padB.style.border = THIS.pickerInset+'px solid';
			p.padB.style.borderColor = THIS.pickerInsetColor;

			// pad mouse area
			p.padM.style.position = 'absolute';
			p.padM.style.left = '0';
			p.padM.style.top = '0';
			p.padM.style.width = THIS.pickerFace + 2*THIS.pickerInset + jscolor.images.pad[0] + jscolor.images.arrow[0] + 'px';
			p.padM.style.height = p.box.style.height;
			p.padM.style.cursor = 'crosshair';

			// slider image
			p.sld.style.overflow = 'hidden';
			p.sld.style.width = jscolor.images.sld[0]+'px';
			p.sld.style.height = jscolor.images.sld[1]+'px';

			// slider border
			p.sldB.style.position = 'absolute';
			p.sldB.style.right = THIS.pickerFace+'px';
			p.sldB.style.top = THIS.pickerFace+'px';
			p.sldB.style.border = THIS.pickerInset+'px solid';
			p.sldB.style.borderColor = THIS.pickerInsetColor;

			// slider mouse area
			p.sldM.style.position = 'absolute';
			p.sldM.style.right = '0';
			p.sldM.style.top = '0';
			p.sldM.style.width = jscolor.images.sld[0] + jscolor.images.arrow[0] + THIS.pickerFace + 2*THIS.pickerInset + 'px';
			p.sldM.style.height = p.box.style.height;
			try {
				p.sldM.style.cursor = 'pointer';
			} catch(eOldIE) {
				p.sldM.style.cursor = 'hand';
			}

			// load images in optimal order
			switch(modeID) {
				case 0: var padImg = 'hs.png'; break;
				case 1: var padImg = 'hv.png'; break;
			}
			p.padM.style.background = "url('"+jscolor.getDir()+"cross.gif') no-repeat";
			p.sldM.style.background = "url('"+jscolor.getDir()+"arrow.gif') no-repeat";
			p.pad.style.background = "url('"+jscolor.getDir()+padImg+"') 0 0 no-repeat";

			// place pointers
			redrawPad();
			redrawSld();

			jscolor.picker.owner = THIS;
			document.getElementsByTagName('body')[0].appendChild(p.boxB);
		}


		function redrawPad() {
			// redraw the pad pointer
			switch(modeID) {
				case 0: var yComponent = 1; break;
				case 1: var yComponent = 2; break;
			}
			var x = Math.round((THIS.hsv[0]/6) * (jscolor.images.pad[0]-1));
			var y = Math.round((1-THIS.hsv[yComponent]) * (jscolor.images.pad[1]-1));
			jscolor.picker.padM.style.backgroundPosition =
				(THIS.pickerFace+THIS.pickerInset+x - Math.floor(jscolor.images.cross[0]/2)) + 'px ' +
				(THIS.pickerFace+THIS.pickerInset+y - Math.floor(jscolor.images.cross[1]/2)) + 'px';

			// redraw the slider image
			var seg = jscolor.picker.sld.childNodes;

			switch(modeID) {
				case 0:
					var rgb = HSV_RGB(THIS.hsv[0], THIS.hsv[1], 1);
					for(var i=0; i<seg.length; i+=1) {
						seg[i].style.backgroundColor = 'rgb('+
							(rgb[0]*(1-i/seg.length)*100)+'%,'+
							(rgb[1]*(1-i/seg.length)*100)+'%,'+
							(rgb[2]*(1-i/seg.length)*100)+'%)';
					}
					break;
				case 1:
					var rgb, s, c = [ THIS.hsv[2], 0, 0 ];
					var i = Math.floor(THIS.hsv[0]);
					var f = i%2 ? THIS.hsv[0]-i : 1-(THIS.hsv[0]-i);
					switch(i) {
						case 6:
						case 0: rgb=[0,1,2]; break;
						case 1: rgb=[1,0,2]; break;
						case 2: rgb=[2,0,1]; break;
						case 3: rgb=[2,1,0]; break;
						case 4: rgb=[1,2,0]; break;
						case 5: rgb=[0,2,1]; break;
					}
					for(var i=0; i<seg.length; i+=1) {
						s = 1 - 1/(seg.length-1)*i;
						c[1] = c[0] * (1 - s*f);
						c[2] = c[0] * (1 - s);
						seg[i].style.backgroundColor = 'rgb('+
							(c[rgb[0]]*100)+'%,'+
							(c[rgb[1]]*100)+'%,'+
							(c[rgb[2]]*100)+'%)';
					}
					break;
			}
		}


		function redrawSld() {
			// redraw the slider pointer
			switch(modeID) {
				case 0: var yComponent = 2; break;
				case 1: var yComponent = 1; break;
			}
			var y = Math.round((1-THIS.hsv[yComponent]) * (jscolor.images.sld[1]-1));
			jscolor.picker.sldM.style.backgroundPosition =
				'0 ' + (THIS.pickerFace+THIS.pickerInset+y - Math.floor(jscolor.images.arrow[1]/2)) + 'px';
		}


		function isPickerOwner() {
			return jscolor.picker && jscolor.picker.owner === THIS;
		}


		function blurTarget() {
			if(valueElement === target) {
				THIS.importColor();
			}
			if(THIS.pickerOnfocus) {
				THIS.hidePicker();
			}
		}


		function blurValue() {
			if(valueElement !== target) {
				THIS.importColor();
			}
		}


		function setPad(e) {
			var posM = jscolor.getMousePos(e);
			var x = posM[0]-posPad[0];
			var y = posM[1]-posPad[1];
			switch(modeID) {
				case 0: THIS.fromHSV(x*(6/(jscolor.images.pad[0]-1)), 1 - y/(jscolor.images.pad[1]-1), null, leaveSld); break;
				case 1: THIS.fromHSV(x*(6/(jscolor.images.pad[0]-1)), null, 1 - y/(jscolor.images.pad[1]-1), leaveSld); break;
			}
		}


		function setSld(e) {
			var posM = jscolor.getMousePos(e);
			var y = posM[1]-posPad[1];
			switch(modeID) {
				case 0: THIS.fromHSV(null, null, 1 - y/(jscolor.images.sld[1]-1), leavePad); break;
				case 1: THIS.fromHSV(null, 1 - y/(jscolor.images.sld[1]-1), null, leavePad); break;
			}
		}


		var THIS = this;
		var modeID = this.pickerMode.toLowerCase()==='hvs' ? 1 : 0;
		var abortBlur = false;
		var
			valueElement = jscolor.fetchElement(this.valueElement),
			styleElement = jscolor.fetchElement(this.styleElement);
		var
			holdPad = false,
			holdSld = false;
		var
			posPad,
			posSld;
		var
			leaveValue = 1<<0,
			leaveStyle = 1<<1,
			leavePad = 1<<2,
			leaveSld = 1<<3;

		// target
		jscolor.addEvent(target, 'focus', function() {
			if(THIS.pickerOnfocus) { THIS.showPicker(); }
		});
		jscolor.addEvent(target, 'blur', function() {
			if(!abortBlur) {
				window.setTimeout(function(){ abortBlur || blurTarget(); abortBlur=false; }, 0);
			} else {
				abortBlur = false;
			}
		});

		// valueElement
		if(valueElement) {
			var updateField = function() {
				THIS.fromString(valueElement.value, leaveValue);
			};
			jscolor.addEvent(valueElement, 'keyup', updateField);
			jscolor.addEvent(valueElement, 'input', updateField);
			jscolor.addEvent(valueElement, 'blur', blurValue);
			valueElement.setAttribute('autocomplete', 'off');
		}

		// styleElement
		if(styleElement) {
			styleElement.jscStyle = {
				backgroundColor : styleElement.style.backgroundColor,
				color : styleElement.style.color
			};
		}

		// require images
		switch(modeID) {
			case 0: jscolor.requireImage('hs.png'); break;
			case 1: jscolor.requireImage('hv.png'); break;
		}
		jscolor.requireImage('cross.gif');
		jscolor.requireImage('arrow.gif');

		this.importColor();
	}

};


jscolor.install();


(function(d){var a=/^\s*|\s*$/g,e,c="B".replace(/A(.)|B/,"$1")==="$1";var b={majorVersion:"3",minorVersion:"4.7",releaseDate:"2011-11-03",_init:function(){var s=this,q=document,o=navigator,g=o.userAgent,m,f,l,k,j,r;s.isOpera=d.opera&&opera.buildNumber;s.isWebKit=/WebKit/.test(g);s.isIE=!s.isWebKit&&!s.isOpera&&(/MSIE/gi).test(g)&&(/Explorer/gi).test(o.appName);s.isIE6=s.isIE&&/MSIE [56]/.test(g);s.isIE7=s.isIE&&/MSIE [7]/.test(g);s.isIE8=s.isIE&&/MSIE [8]/.test(g);s.isIE9=s.isIE&&/MSIE [9]/.test(g);s.isGecko=!s.isWebKit&&/Gecko/.test(g);s.isMac=g.indexOf("Mac")!=-1;s.isAir=/adobeair/i.test(g);s.isIDevice=/(iPad|iPhone)/.test(g);s.isIOS5=s.isIDevice&&g.match(/AppleWebKit\/(\d*)/)[1]>=534;if(d.tinyMCEPreInit){s.suffix=tinyMCEPreInit.suffix;s.baseURL=tinyMCEPreInit.base;s.query=tinyMCEPreInit.query;return}s.suffix="";f=q.getElementsByTagName("base");for(m=0;m<f.length;m++){if(r=f[m].href){if(/^https?:\/\/[^\/]+$/.test(r)){r+="/"}k=r?r.match(/.*\//)[0]:""}}function h(i){if(i.src&&/tiny_mce(|_gzip|_jquery|_prototype|_full)(_dev|_src)?.js/.test(i.src)){if(/_(src|dev)\.js/g.test(i.src)){s.suffix="_src"}if((j=i.src.indexOf("?"))!=-1){s.query=i.src.substring(j+1)}s.baseURL=i.src.substring(0,i.src.lastIndexOf("/"));if(k&&s.baseURL.indexOf("://")==-1&&s.baseURL.indexOf("/")!==0){s.baseURL=k+s.baseURL}return s.baseURL}return null}f=q.getElementsByTagName("script");for(m=0;m<f.length;m++){if(h(f[m])){return}}l=q.getElementsByTagName("head")[0];if(l){f=l.getElementsByTagName("script");for(m=0;m<f.length;m++){if(h(f[m])){return}}}return},is:function(g,f){if(!f){return g!==e}if(f=="array"&&(g.hasOwnProperty&&g instanceof Array)){return true}return typeof(g)==f},makeMap:function(f,j,h){var g;f=f||[];j=j||",";if(typeof(f)=="string"){f=f.split(j)}h=h||{};g=f.length;while(g--){h[f[g]]={}}return h},each:function(i,f,h){var j,g;if(!i){return 0}h=h||i;if(i.length!==e){for(j=0,g=i.length;j<g;j++){if(f.call(h,i[j],j,i)===false){return 0}}}else{for(j in i){if(i.hasOwnProperty(j)){if(f.call(h,i[j],j,i)===false){return 0}}}}return 1},map:function(g,h){var i=[];b.each(g,function(f){i.push(h(f))});return i},grep:function(g,h){var i=[];b.each(g,function(f){if(!h||h(f)){i.push(f)}});return i},inArray:function(g,h){var j,f;if(g){for(j=0,f=g.length;j<f;j++){if(g[j]===h){return j}}}return -1},extend:function(k,j){var h,g,f=arguments;for(h=1,g=f.length;h<g;h++){j=f[h];b.each(j,function(i,l){if(i!==e){k[l]=i}})}return k},trim:function(f){return(f?""+f:"").replace(a,"")},create:function(o,f,j){var n=this,g,i,k,l,h,m=0;o=/^((static) )?([\w.]+)(:([\w.]+))?/.exec(o);k=o[3].match(/(^|\.)(\w+)$/i)[2];i=n.createNS(o[3].replace(/\.\w+$/,""),j);if(i[k]){return}if(o[2]=="static"){i[k]=f;if(this.onCreate){this.onCreate(o[2],o[3],i[k])}return}if(!f[k]){f[k]=function(){};m=1}i[k]=f[k];n.extend(i[k].prototype,f);if(o[5]){g=n.resolve(o[5]).prototype;l=o[5].match(/\.(\w+)$/i)[1];h=i[k];if(m){i[k]=function(){return g[l].apply(this,arguments)}}else{i[k]=function(){this.parent=g[l];return h.apply(this,arguments)}}i[k].prototype[k]=i[k];n.each(g,function(p,q){i[k].prototype[q]=g[q]});n.each(f,function(p,q){if(g[q]){i[k].prototype[q]=function(){this.parent=g[q];return p.apply(this,arguments)}}else{if(q!=k){i[k].prototype[q]=p}}})}n.each(f["static"],function(p,q){i[k][q]=p});if(this.onCreate){this.onCreate(o[2],o[3],i[k].prototype)}},walk:function(i,h,j,g){g=g||this;if(i){if(j){i=i[j]}b.each(i,function(k,f){if(h.call(g,k,f,j)===false){return false}b.walk(k,h,j,g)})}},createNS:function(j,h){var g,f;h=h||d;j=j.split(".");for(g=0;g<j.length;g++){f=j[g];if(!h[f]){h[f]={}}h=h[f]}return h},resolve:function(j,h){var g,f;h=h||d;j=j.split(".");for(g=0,f=j.length;g<f;g++){h=h[j[g]];if(!h){break}}return h},addUnload:function(j,i){var h=this;j={func:j,scope:i||this};if(!h.unloads){function g(){var f=h.unloads,l,m;if(f){for(m in f){l=f[m];if(l&&l.func){l.func.call(l.scope,1)}}if(d.detachEvent){d.detachEvent("onbeforeunload",k);d.detachEvent("onunload",g)}else{if(d.removeEventListener){d.removeEventListener("unload",g,false)}}h.unloads=l=f=w=g=0;if(d.CollectGarbage){CollectGarbage()}}}function k(){var l=document;if(l.readyState=="interactive"){function f(){l.detachEvent("onstop",f);if(g){g()}l=0}if(l){l.attachEvent("onstop",f)}d.setTimeout(function(){if(l){l.detachEvent("onstop",f)}},0)}}if(d.attachEvent){d.attachEvent("onunload",g);d.attachEvent("onbeforeunload",k)}else{if(d.addEventListener){d.addEventListener("unload",g,false)}}h.unloads=[j]}else{h.unloads.push(j)}return j},removeUnload:function(i){var g=this.unloads,h=null;b.each(g,function(j,f){if(j&&j.func==i){g.splice(f,1);h=i;return false}});return h},explode:function(f,g){return f?b.map(f.split(g||","),b.trim):f},_addVer:function(g){var f;if(!this.query){return g}f=(g.indexOf("?")==-1?"?":"&")+this.query;if(g.indexOf("#")==-1){return g+f}return g.replace("#",f+"#")},_replace:function(h,f,g){if(c){return g.replace(h,function(){var l=f,j=arguments,k;for(k=0;k<j.length-2;k++){if(j[k]===e){l=l.replace(new RegExp("\\$"+k,"g"),"")}else{l=l.replace(new RegExp("\\$"+k,"g"),j[k])}}return l})}return g.replace(h,f)}};b._init();d.tinymce=d.tinyMCE=b})(window);tinymce.create("tinymce.util.Dispatcher",{scope:null,listeners:null,Dispatcher:function(a){this.scope=a||this;this.listeners=[]},add:function(a,b){this.listeners.push({cb:a,scope:b||this.scope});return a},addToTop:function(a,b){this.listeners.unshift({cb:a,scope:b||this.scope});return a},remove:function(a){var b=this.listeners,c=null;tinymce.each(b,function(e,d){if(a==e.cb){c=a;b.splice(d,1);return false}});return c},dispatch:function(){var f,d=arguments,e,b=this.listeners,g;for(e=0;e<b.length;e++){g=b[e];f=g.cb.apply(g.scope,d);if(f===false){break}}return f}});(function(){var a=tinymce.each;tinymce.create("tinymce.util.URI",{URI:function(e,g){var f=this,i,d,c,h;e=tinymce.trim(e);g=f.settings=g||{};if(/^([\w\-]+):([^\/]{2})/i.test(e)||/^\s*#/.test(e)){f.source=e;return}if(e.indexOf("/")===0&&e.indexOf("//")!==0){e=(g.base_uri?g.base_uri.protocol||"http":"http")+"://mce_host"+e}if(!/^[\w-]*:?\/\//.test(e)){h=g.base_uri?g.base_uri.path:new tinymce.util.URI(location.href).directory;e=((g.base_uri&&g.base_uri.protocol)||"http")+"://mce_host"+f.toAbsPath(h,e)}e=e.replace(/@@/g,"(mce_at)");e=/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(e);a(["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],function(b,j){var k=e[j];if(k){k=k.replace(/\(mce_at\)/g,"@@")}f[b]=k});if(c=g.base_uri){if(!f.protocol){f.protocol=c.protocol}if(!f.userInfo){f.userInfo=c.userInfo}if(!f.port&&f.host=="mce_host"){f.port=c.port}if(!f.host||f.host=="mce_host"){f.host=c.host}f.source=""}},setPath:function(c){var b=this;c=/^(.*?)\/?(\w+)?$/.exec(c);b.path=c[0];b.directory=c[1];b.file=c[2];b.source="";b.getURI()},toRelative:function(b){var c=this,d;if(b==="./"){return b}b=new tinymce.util.URI(b,{base_uri:c});if((b.host!="mce_host"&&c.host!=b.host&&b.host)||c.port!=b.port||c.protocol!=b.protocol){return b.getURI()}d=c.toRelPath(c.path,b.path);if(b.query){d+="?"+b.query}if(b.anchor){d+="#"+b.anchor}return d},toAbsolute:function(b,c){var b=new tinymce.util.URI(b,{base_uri:this});return b.getURI(this.host==b.host&&this.protocol==b.protocol?c:0)},toRelPath:function(g,h){var c,f=0,d="",e,b;g=g.substring(0,g.lastIndexOf("/"));g=g.split("/");c=h.split("/");if(g.length>=c.length){for(e=0,b=g.length;e<b;e++){if(e>=c.length||g[e]!=c[e]){f=e+1;break}}}if(g.length<c.length){for(e=0,b=c.length;e<b;e++){if(e>=g.length||g[e]!=c[e]){f=e+1;break}}}if(f==1){return h}for(e=0,b=g.length-(f-1);e<b;e++){d+="../"}for(e=f-1,b=c.length;e<b;e++){if(e!=f-1){d+="/"+c[e]}else{d+=c[e]}}return d},toAbsPath:function(e,f){var c,b=0,h=[],d,g;d=/\/$/.test(f)?"/":"";e=e.split("/");f=f.split("/");a(e,function(i){if(i){h.push(i)}});e=h;for(c=f.length-1,h=[];c>=0;c--){if(f[c].length==0||f[c]=="."){continue}if(f[c]==".."){b++;continue}if(b>0){b--;continue}h.push(f[c])}c=e.length-b;if(c<=0){g=h.reverse().join("/")}else{g=e.slice(0,c).join("/")+"/"+h.reverse().join("/")}if(g.indexOf("/")!==0){g="/"+g}if(d&&g.lastIndexOf("/")!==g.length-1){g+=d}return g},getURI:function(d){var c,b=this;if(!b.source||d){c="";if(!d){if(b.protocol){c+=b.protocol+"://"}if(b.userInfo){c+=b.userInfo+"@"}if(b.host){c+=b.host}if(b.port){c+=":"+b.port}}if(b.path){c+=b.path}if(b.query){c+="?"+b.query}if(b.anchor){c+="#"+b.anchor}b.source=c}return b.source}})})();(function(){var a=tinymce.each;tinymce.create("static tinymce.util.Cookie",{getHash:function(d){var b=this.get(d),c;if(b){a(b.split("&"),function(e){e=e.split("=");c=c||{};c[unescape(e[0])]=unescape(e[1])})}return c},setHash:function(j,b,g,f,i,c){var h="";a(b,function(e,d){h+=(!h?"":"&")+escape(d)+"="+escape(e)});this.set(j,h,g,f,i,c)},get:function(i){var h=document.cookie,g,f=i+"=",d;if(!h){return}d=h.indexOf("; "+f);if(d==-1){d=h.indexOf(f);if(d!=0){return null}}else{d+=2}g=h.indexOf(";",d);if(g==-1){g=h.length}return unescape(h.substring(d+f.length,g))},set:function(i,b,g,f,h,c){document.cookie=i+"="+escape(b)+((g)?"; expires="+g.toGMTString():"")+((f)?"; path="+escape(f):"")+((h)?"; domain="+h:"")+((c)?"; secure":"")},remove:function(e,b){var c=new Date();c.setTime(c.getTime()-1000);this.set(e,"",c,b,c)}})})();(function(){function serialize(o,quote){var i,v,t;quote=quote||'"';if(o==null){return"null"}t=typeof o;if(t=="string"){v="\bb\tt\nn\ff\rr\"\"''\\\\";return quote+o.replace(/([\u0080-\uFFFF\x00-\x1f\"\'\\])/g,function(a,b){if(quote==='"'&&a==="'"){return a}i=v.indexOf(b);if(i+1){return"\\"+v.charAt(i+1)}a=b.charCodeAt().toString(16);return"\\u"+"0000".substring(a.length)+a})+quote}if(t=="object"){if(o.hasOwnProperty&&o instanceof Array){for(i=0,v="[";i<o.length;i++){v+=(i>0?",":"")+serialize(o[i],quote)}return v+"]"}v="{";for(i in o){if(o.hasOwnProperty(i)){v+=typeof o[i]!="function"?(v.length>1?","+quote:quote)+i+quote+":"+serialize(o[i],quote):""}}return v+"}"}return""+o}tinymce.util.JSON={serialize:serialize,parse:function(s){try{return eval("("+s+")")}catch(ex){}}}})();tinymce.create("static tinymce.util.XHR",{send:function(g){var a,e,b=window,h=0;g.scope=g.scope||this;g.success_scope=g.success_scope||g.scope;g.error_scope=g.error_scope||g.scope;g.async=g.async===false?false:true;g.data=g.data||"";function d(i){a=0;try{a=new ActiveXObject(i)}catch(c){}return a}a=b.XMLHttpRequest?new XMLHttpRequest():d("Microsoft.XMLHTTP")||d("Msxml2.XMLHTTP");if(a){if(a.overrideMimeType){a.overrideMimeType(g.content_type)}a.open(g.type||(g.data?"POST":"GET"),g.url,g.async);if(g.content_type){a.setRequestHeader("Content-Type",g.content_type)}a.setRequestHeader("X-Requested-With","XMLHttpRequest");a.send(g.data);function f(){if(!g.async||a.readyState==4||h++>10000){if(g.success&&h<10000&&a.status==200){g.success.call(g.success_scope,""+a.responseText,a,g)}else{if(g.error){g.error.call(g.error_scope,h>10000?"TIMED_OUT":"GENERAL",a,g)}}a=null}else{b.setTimeout(f,10)}}if(!g.async){return f()}e=b.setTimeout(f,10)}}});(function(){var c=tinymce.extend,b=tinymce.util.JSON,a=tinymce.util.XHR;tinymce.create("tinymce.util.JSONRequest",{JSONRequest:function(d){this.settings=c({},d);this.count=0},send:function(f){var e=f.error,d=f.success;f=c(this.settings,f);f.success=function(h,g){h=b.parse(h);if(typeof(h)=="undefined"){h={error:"JSON Parse error."}}if(h.error){e.call(f.error_scope||f.scope,h.error,g)}else{d.call(f.success_scope||f.scope,h.result)}};f.error=function(h,g){if(e){e.call(f.error_scope||f.scope,h,g)}};f.data=b.serialize({id:f.id||"c"+(this.count++),method:f.method,params:f.params});f.content_type="application/json";a.send(f)},"static":{sendRPC:function(d){return new tinymce.util.JSONRequest().send(d)}}})}());(function(a){a.VK={DELETE:46,BACKSPACE:8,ENTER:13,TAB:9,SPACEBAR:32,UP:38,DOWN:40}})(tinymce);(function(k){var i=k.VK,j=i.BACKSPACE,h=i.DELETE;function c(m){var o=m.dom,n=m.selection;m.onKeyDown.add(function(q,u){var p,v,s,t,r;r=u.keyCode==h;if(r||u.keyCode==j){u.preventDefault();p=n.getRng();v=o.getParent(p.startContainer,o.isBlock);if(r){v=o.getNext(v,o.isBlock)}if(v){s=v.firstChild;while(s&&s.nodeType==3&&s.nodeValue.length==0){s=s.nextSibling}if(s&&s.nodeName==="SPAN"){t=s.cloneNode(false)}}q.getDoc().execCommand(r?"ForwardDelete":"Delete",false,null);v=o.getParent(p.startContainer,o.isBlock);k.each(o.select("span.Apple-style-span,font.Apple-style-span",v),function(x){var y=n.getBookmark();if(t){o.replace(t.cloneNode(false),x,true)}else{o.remove(x,true)}n.moveToBookmark(y)})}})}function d(m){m.onKeyUp.add(function(n,p){var o=p.keyCode;if(o==h||o==j){if(n.dom.isEmpty(n.getBody())){n.setContent("",{format:"raw"});n.nodeChanged();return}}})}function b(m){m.dom.bind(m.getDoc(),"focusin",function(){m.selection.setRng(m.selection.getRng())})}function e(m){m.onKeyDown.add(function(n,q){if(q.keyCode===j){if(n.selection.isCollapsed()&&n.selection.getRng(true).startOffset===0){var p=n.selection.getNode();var o=p.previousSibling;if(o&&o.nodeName&&o.nodeName.toLowerCase()==="hr"){n.dom.remove(o);k.dom.Event.cancel(q)}}}})}function g(m){if(!Range.prototype.getClientRects){m.onMouseDown.add(function(o,p){if(p.target.nodeName==="HTML"){var n=o.getBody();n.blur();setTimeout(function(){n.focus()},0)}})}}function f(m){m.onClick.add(function(n,o){o=o.target;if(/^(IMG|HR)$/.test(o.nodeName)){n.selection.getSel().setBaseAndExtent(o,0,o,1)}if(o.nodeName=="A"&&n.dom.hasClass(o,"mceItemAnchor")){n.selection.select(o)}n.nodeChanged()})}function l(m){var o,n;m.dom.bind(m.getDoc(),"selectionchange",function(){if(n){clearTimeout(n);n=0}n=window.setTimeout(function(){var p=m.selection.getRng();if(!o||!k.dom.RangeUtils.compareRanges(p,o)){m.nodeChanged();o=p}},50)})}function a(m){document.body.setAttribute("role","application")}k.create("tinymce.util.Quirks",{Quirks:function(m){if(k.isWebKit){c(m);d(m);b(m);f(m);if(k.isIDevice){l(m)}}if(k.isIE){e(m);d(m);a(m)}if(k.isGecko){e(m);g(m)}}})})(tinymce);(function(j){var a,g,d,k=/[&<>\"\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,b=/[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,f=/[<>&\"\']/g,c=/&(#x|#)?([\w]+);/g,i={128:"\u20AC",130:"\u201A",131:"\u0192",132:"\u201E",133:"\u2026",134:"\u2020",135:"\u2021",136:"\u02C6",137:"\u2030",138:"\u0160",139:"\u2039",140:"\u0152",142:"\u017D",145:"\u2018",146:"\u2019",147:"\u201C",148:"\u201D",149:"\u2022",150:"\u2013",151:"\u2014",152:"\u02DC",153:"\u2122",154:"\u0161",155:"\u203A",156:"\u0153",158:"\u017E",159:"\u0178"};g={'"':"&quot;","'":"&#39;","<":"&lt;",">":"&gt;","&":"&amp;"};d={"&lt;":"<","&gt;":">","&amp;":"&","&quot;":'"',"&apos;":"'"};function h(l){var m;m=document.createElement("div");m.innerHTML=l;return m.textContent||m.innerText||l}function e(m,p){var n,o,l,q={};if(m){m=m.split(",");p=p||10;for(n=0;n<m.length;n+=2){o=String.fromCharCode(parseInt(m[n],p));if(!g[o]){l="&"+m[n+1]+";";q[o]=l;q[l]=o}}return q}}a=e("50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,t9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro",32);j.html=j.html||{};j.html.Entities={encodeRaw:function(m,l){return m.replace(l?k:b,function(n){return g[n]||n})},encodeAllRaw:function(l){return(""+l).replace(f,function(m){return g[m]||m})},encodeNumeric:function(m,l){return m.replace(l?k:b,function(n){if(n.length>1){return"&#"+(((n.charCodeAt(0)-55296)*1024)+(n.charCodeAt(1)-56320)+65536)+";"}return g[n]||"&#"+n.charCodeAt(0)+";"})},encodeNamed:function(n,l,m){m=m||a;return n.replace(l?k:b,function(o){return g[o]||m[o]||o})},getEncodeFunc:function(l,o){var p=j.html.Entities;o=e(o)||a;function m(r,q){return r.replace(q?k:b,function(s){return g[s]||o[s]||"&#"+s.charCodeAt(0)+";"||s})}function n(r,q){return p.encodeNamed(r,q,o)}l=j.makeMap(l.replace(/\+/g,","));if(l.named&&l.numeric){return m}if(l.named){if(o){return n}return p.encodeNamed}if(l.numeric){return p.encodeNumeric}return p.encodeRaw},decode:function(l){return l.replace(c,function(n,m,o){if(m){o=parseInt(o,m.length===2?16:10);if(o>65535){o-=65536;return String.fromCharCode(55296+(o>>10),56320+(o&1023))}else{return i[o]||String.fromCharCode(o)}}return d[n]||a[n]||h(n)})}}})(tinymce);tinymce.html.Styles=function(d,f){var k=/rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi,h=/(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi,b=/\s*([^:]+):\s*([^;]+);?/g,l=/\s+$/,m=/rgb/,e,g,a={},j;d=d||{};j="\\\" \\' \\; \\: ; : \uFEFF".split(" ");for(g=0;g<j.length;g++){a[j[g]]="\uFEFF"+g;a["\uFEFF"+g]=j[g]}function c(n,q,p,i){function o(r){r=parseInt(r).toString(16);return r.length>1?r:"0"+r}return"#"+o(q)+o(p)+o(i)}return{toHex:function(i){return i.replace(k,c)},parse:function(r){var y={},p,n,v,q,u=d.url_converter,x=d.url_converter_scope||this;function o(C,F){var E,B,A,D;E=y[C+"-top"+F];if(!E){return}B=y[C+"-right"+F];if(E!=B){return}A=y[C+"-bottom"+F];if(B!=A){return}D=y[C+"-left"+F];if(A!=D){return}y[C+F]=D;delete y[C+"-top"+F];delete y[C+"-right"+F];delete y[C+"-bottom"+F];delete y[C+"-left"+F]}function t(B){var C=y[B],A;if(!C||C.indexOf(" ")<0){return}C=C.split(" ");A=C.length;while(A--){if(C[A]!==C[0]){return false}}y[B]=C[0];return true}function z(C,B,A,D){if(!t(B)){return}if(!t(A)){return}if(!t(D)){return}y[C]=y[B]+" "+y[A]+" "+y[D];delete y[B];delete y[A];delete y[D]}function s(A){q=true;return a[A]}function i(B,A){if(q){B=B.replace(/\uFEFF[0-9]/g,function(C){return a[C]})}if(!A){B=B.replace(/\\([\'\";:])/g,"$1")}return B}if(r){r=r.replace(/\\[\"\';:\uFEFF]/g,s).replace(/\"[^\"]+\"|\'[^\']+\'/g,function(A){return A.replace(/[;:]/g,s)});while(p=b.exec(r)){n=p[1].replace(l,"").toLowerCase();v=p[2].replace(l,"");if(n&&v.length>0){if(n==="font-weight"&&v==="700"){v="bold"}else{if(n==="color"||n==="background-color"){v=v.toLowerCase()}}v=v.replace(k,c);v=v.replace(h,function(B,A,E,D,F,C){F=F||C;if(F){F=i(F);return"'"+F.replace(/\'/g,"\\'")+"'"}A=i(A||E||D);if(u){A=u.call(x,A,"style")}return"url('"+A.replace(/\'/g,"\\'")+"')"});y[n]=q?i(v,true):v}b.lastIndex=p.index+p[0].length}o("border","");o("border","-width");o("border","-color");o("border","-style");o("padding","");o("margin","");z("border","border-width","border-style","border-color");if(y.border==="medium none"){delete y.border}}return y},serialize:function(p,r){var o="",n,q;function i(t){var x,u,s,v;x=f.styles[t];if(x){for(u=0,s=x.length;u<s;u++){t=x[u];v=p[t];if(v!==e&&v.length>0){o+=(o.length>0?" ":"")+t+": "+v+";"}}}}if(r&&f&&f.styles){i("*");i(r)}else{for(n in p){q=p[n];if(q!==e&&q.length>0){o+=(o.length>0?" ":"")+n+": "+q+";"}}}return o}}};(function(m){var h={},j,l,g,f,c={},b,e,d=m.makeMap,k=m.each;function i(o,n){return o.split(n||",")}function a(r,q){var o,p={};function n(s){return s.replace(/[A-Z]+/g,function(t){return n(r[t])})}for(o in r){if(r.hasOwnProperty(o)){r[o]=n(r[o])}}n(q).replace(/#/g,"#text").replace(/(\w+)\[([^\]]+)\]\[([^\]]*)\]/g,function(v,t,s,u){s=i(s,"|");p[t]={attributes:d(s),attributesOrder:s,children:d(u,"|",{"#comment":{}})}});return p}l="h1,h2,h3,h4,h5,h6,hr,p,div,address,pre,form,table,tbody,thead,tfoot,th,tr,td,li,ol,ul,caption,blockquote,center,dl,dt,dd,dir,fieldset,noscript,menu,isindex,samp,header,footer,article,section,hgroup";l=d(l,",",d(l.toUpperCase()));h=a({Z:"H|K|N|O|P",Y:"X|form|R|Q",ZG:"E|span|width|align|char|charoff|valign",X:"p|T|div|U|W|isindex|fieldset|table",ZF:"E|align|char|charoff|valign",W:"pre|hr|blockquote|address|center|noframes",ZE:"abbr|axis|headers|scope|rowspan|colspan|align|char|charoff|valign|nowrap|bgcolor|width|height",ZD:"[E][S]",U:"ul|ol|dl|menu|dir",ZC:"p|Y|div|U|W|table|br|span|bdo|object|applet|img|map|K|N|Q",T:"h1|h2|h3|h4|h5|h6",ZB:"X|S|Q",S:"R|P",ZA:"a|G|J|M|O|P",R:"a|H|K|N|O",Q:"noscript|P",P:"ins|del|script",O:"input|select|textarea|label|button",N:"M|L",M:"em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym",L:"sub|sup",K:"J|I",J:"tt|i|b|u|s|strike",I:"big|small|font|basefont",H:"G|F",G:"br|span|bdo",F:"object|applet|img|map|iframe",E:"A|B|C",D:"accesskey|tabindex|onfocus|onblur",C:"onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup",B:"lang|xml:lang|dir",A:"id|class|style|title"},"script[id|charset|type|language|src|defer|xml:space][]style[B|id|type|media|title|xml:space][]object[E|declare|classid|codebase|data|type|codetype|archive|standby|width|height|usemap|name|tabindex|align|border|hspace|vspace][#|param|Y]param[id|name|value|valuetype|type][]p[E|align][#|S]a[E|D|charset|type|name|href|hreflang|rel|rev|shape|coords|target][#|Z]br[A|clear][]span[E][#|S]bdo[A|C|B][#|S]applet[A|codebase|archive|code|object|alt|name|width|height|align|hspace|vspace][#|param|Y]h1[E|align][#|S]img[E|src|alt|name|longdesc|width|height|usemap|ismap|align|border|hspace|vspace][]map[B|C|A|name][X|form|Q|area]h2[E|align][#|S]iframe[A|longdesc|name|src|frameborder|marginwidth|marginheight|scrolling|align|width|height][#|Y]h3[E|align][#|S]tt[E][#|S]i[E][#|S]b[E][#|S]u[E][#|S]s[E][#|S]strike[E][#|S]big[E][#|S]small[E][#|S]font[A|B|size|color|face][#|S]basefont[id|size|color|face][]em[E][#|S]strong[E][#|S]dfn[E][#|S]code[E][#|S]q[E|cite][#|S]samp[E][#|S]kbd[E][#|S]var[E][#|S]cite[E][#|S]abbr[E][#|S]acronym[E][#|S]sub[E][#|S]sup[E][#|S]input[E|D|type|name|value|checked|disabled|readonly|size|maxlength|src|alt|usemap|onselect|onchange|accept|align][]select[E|name|size|multiple|disabled|tabindex|onfocus|onblur|onchange][optgroup|option]optgroup[E|disabled|label][option]option[E|selected|disabled|label|value][]textarea[E|D|name|rows|cols|disabled|readonly|onselect|onchange][]label[E|for|accesskey|onfocus|onblur][#|S]button[E|D|name|value|type|disabled][#|p|T|div|U|W|table|G|object|applet|img|map|K|N|Q]h4[E|align][#|S]ins[E|cite|datetime][#|Y]h5[E|align][#|S]del[E|cite|datetime][#|Y]h6[E|align][#|S]div[E|align][#|Y]ul[E|type|compact][li]li[E|type|value][#|Y]ol[E|type|compact|start][li]dl[E|compact][dt|dd]dt[E][#|S]dd[E][#|Y]menu[E|compact][li]dir[E|compact][li]pre[E|width|xml:space][#|ZA]hr[E|align|noshade|size|width][]blockquote[E|cite][#|Y]address[E][#|S|p]center[E][#|Y]noframes[E][#|Y]isindex[A|B|prompt][]fieldset[E][#|legend|Y]legend[E|accesskey|align][#|S]table[E|summary|width|border|frame|rules|cellspacing|cellpadding|align|bgcolor][caption|col|colgroup|thead|tfoot|tbody|tr]caption[E|align][#|S]col[ZG][]colgroup[ZG][col]thead[ZF][tr]tr[ZF|bgcolor][th|td]th[E|ZE][#|Y]form[E|action|method|name|enctype|onsubmit|onreset|accept|accept-charset|target][#|X|R|Q]noscript[E][#|Y]td[E|ZE][#|Y]tfoot[ZF][tr]tbody[ZF][tr]area[E|D|shape|coords|href|nohref|alt|target][]base[id|href|target][]body[E|onload|onunload|background|bgcolor|text|link|vlink|alink][#|Y]");j=d("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected,autoplay,loop,controls");g=d("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed,source");f=m.extend(d("td,th,iframe,video,audio,object"),g);b=d("pre,script,style,textarea");e=d("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");m.html.Schema=function(r){var A=this,n={},o={},y=[],q,p;r=r||{};if(r.verify_html===false){r.valid_elements="*[*]"}if(r.valid_styles){q={};k(r.valid_styles,function(C,B){q[B]=m.explode(C)})}p=r.whitespace_elements?d(r.whitespace_elements):b;function z(B){return new RegExp("^"+B.replace(/([?+*])/g,".$1")+"$")}function t(I){var H,D,W,S,X,C,F,R,U,N,V,Z,L,G,T,B,P,E,Y,aa,M,Q,K=/^([#+-])?([^\[\/]+)(?:\/([^\[]+))?(?:\[([^\]]+)\])?$/,O=/^([!\-])?(\w+::\w+|[^=:<]+)?(?:([=:<])(.*))?$/,J=/[*?+]/;if(I){I=i(I);if(n["@"]){P=n["@"].attributes;E=n["@"].attributesOrder}for(H=0,D=I.length;H<D;H++){C=K.exec(I[H]);if(C){T=C[1];N=C[2];B=C[3];U=C[4];L={};G=[];F={attributes:L,attributesOrder:G};if(T==="#"){F.paddEmpty=true}if(T==="-"){F.removeEmpty=true}if(P){for(aa in P){L[aa]=P[aa]}G.push.apply(G,E)}if(U){U=i(U,"|");for(W=0,S=U.length;W<S;W++){C=O.exec(U[W]);if(C){R={};Z=C[1];V=C[2].replace(/::/g,":");T=C[3];Q=C[4];if(Z==="!"){F.attributesRequired=F.attributesRequired||[];F.attributesRequired.push(V);R.required=true}if(Z==="-"){delete L[V];G.splice(m.inArray(G,V),1);continue}if(T){if(T==="="){F.attributesDefault=F.attributesDefault||[];F.attributesDefault.push({name:V,value:Q});R.defaultValue=Q}if(T===":"){F.attributesForced=F.attributesForced||[];F.attributesForced.push({name:V,value:Q});R.forcedValue=Q}if(T==="<"){R.validValues=d(Q,"?")}}if(J.test(V)){F.attributePatterns=F.attributePatterns||[];R.pattern=z(V);F.attributePatterns.push(R)}else{if(!L[V]){G.push(V)}L[V]=R}}}}if(!P&&N=="@"){P=L;E=G}if(B){F.outputName=N;n[B]=F}if(J.test(N)){F.pattern=z(N);y.push(F)}else{n[N]=F}}}}}function v(B){n={};y=[];t(B);k(h,function(D,C){o[C]=D.children})}function s(C){var B=/^(~)?(.+)$/;if(C){k(i(C),function(G){var E=B.exec(G),F=E[1]==="~",H=F?"span":"div",D=E[2];o[D]=o[H];c[D]=H;if(!F){l[D]={}}k(o,function(I,J){if(I[H]){I[D]=I[H]}})})}}function u(C){var B=/^([+\-]?)(\w+)\[([^\]]+)\]$/;if(C){k(i(C),function(G){var F=B.exec(G),D,E;if(F){E=F[1];if(E){D=o[F[2]]}else{D=o[F[2]]={"#comment":{}}}D=o[F[2]];k(i(F[3],"|"),function(H){if(E==="-"){delete D[H]}else{D[H]={}}})}})}}function x(B){var D=n[B],C;if(D){return D}C=y.length;while(C--){D=y[C];if(D.pattern.test(B)){return D}}}if(!r.valid_elements){k(h,function(C,B){n[B]={attributes:C.attributes,attributesOrder:C.attributesOrder};o[B]=C.children});k(i("strong/b,em/i"),function(B){B=i(B,"/");n[B[1]].outputName=B[0]});n.img.attributesDefault=[{name:"alt",value:""}];k(i("ol,ul,sub,sup,blockquote,span,font,a,table,tbody,tr"),function(B){n[B].removeEmpty=true});k(i("p,h1,h2,h3,h4,h5,h6,th,td,pre,div,address,caption"),function(B){n[B].paddEmpty=true})}else{v(r.valid_elements)}s(r.custom_elements);u(r.valid_children);t(r.extended_valid_elements);u("+ol[ul|ol],+ul[ul|ol]");if(!x("span")){t("span[!data-mce-type|*]")}if(r.invalid_elements){m.each(m.explode(r.invalid_elements),function(B){if(n[B]){delete n[B]}})}A.children=o;A.styles=q;A.getBoolAttrs=function(){return j};A.getBlockElements=function(){return l};A.getShortEndedElements=function(){return g};A.getSelfClosingElements=function(){return e};A.getNonEmptyElements=function(){return f};A.getWhiteSpaceElements=function(){return p};A.isValidChild=function(B,D){var C=o[B];return !!(C&&C[D])};A.getElementRule=x;A.getCustomElements=function(){return c};A.addValidElements=t;A.setValidElements=v;A.addCustomElements=s;A.addValidChildren=u};m.html.Schema.boolAttrMap=j;m.html.Schema.blockElementsMap=l})(tinymce);(function(a){a.html.SaxParser=function(c,e){var b=this,d=function(){};c=c||{};b.schema=e=e||new a.html.Schema();if(c.fix_self_closing!==false){c.fix_self_closing=true}a.each("comment cdata text start end pi doctype".split(" "),function(f){if(f){b[f]=c[f]||d}});b.parse=function(D){var n=this,g,F=0,H,A,z=[],M,P,B,q,y,r,L,G,N,u,m,k,s,Q,o,O,E,R,K,f,I,l,C,J,h,v=0,j=a.html.Entities.decode,x,p;function t(S){var U,T;U=z.length;while(U--){if(z[U].name===S){break}}if(U>=0){for(T=z.length-1;T>=U;T--){S=z[T];if(S.valid){n.end(S.name)}}z.length=U}}l=new RegExp("<(?:(?:!--([\\w\\W]*?)-->)|(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|(?:!DOCTYPE([\\w\\W]*?)>)|(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|(?:\\/([^>]+)>)|(?:([^\\s\\/<>]+)((?:\\s+[^\"'>]+(?:(?:\"[^\"]*\")|(?:'[^']*')|[^>]*))*|\\/)>))","g");C=/([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:\\.|[^\"])*)\")|(?:\'((?:\\.|[^\'])*)\')|([^>\s]+)))?/g;J={script:/<\/script[^>]*>/gi,style:/<\/style[^>]*>/gi,noscript:/<\/noscript[^>]*>/gi};L=e.getShortEndedElements();I=e.getSelfClosingElements();G=e.getBoolAttrs();u=c.validate;r=c.remove_internals;x=c.fix_self_closing;p=a.isIE;o=/^:/;while(g=l.exec(D)){if(F<g.index){n.text(j(D.substr(F,g.index-F)))}if(H=g[6]){H=H.toLowerCase();if(p&&o.test(H)){H=H.substr(1)}t(H)}else{if(H=g[7]){H=H.toLowerCase();if(p&&o.test(H)){H=H.substr(1)}N=H in L;if(x&&I[H]&&z.length>0&&z[z.length-1].name===H){t(H)}if(!u||(m=e.getElementRule(H))){k=true;if(u){O=m.attributes;E=m.attributePatterns}if(Q=g[8]){y=Q.indexOf("data-mce-type")!==-1;if(y&&r){k=false}M=[];M.map={};Q.replace(C,function(T,S,X,W,V){var Y,U;S=S.toLowerCase();X=S in G?S:j(X||W||V||"");if(u&&!y&&S.indexOf("data-")!==0){Y=O[S];if(!Y&&E){U=E.length;while(U--){Y=E[U];if(Y.pattern.test(S)){break}}if(U===-1){Y=null}}if(!Y){return}if(Y.validValues&&!(X in Y.validValues)){return}}M.map[S]=X;M.push({name:S,value:X})})}else{M=[];M.map={}}if(u&&!y){R=m.attributesRequired;K=m.attributesDefault;f=m.attributesForced;if(f){P=f.length;while(P--){s=f[P];q=s.name;h=s.value;if(h==="{$uid}"){h="mce_"+v++}M.map[q]=h;M.push({name:q,value:h})}}if(K){P=K.length;while(P--){s=K[P];q=s.name;if(!(q in M.map)){h=s.value;if(h==="{$uid}"){h="mce_"+v++}M.map[q]=h;M.push({name:q,value:h})}}}if(R){P=R.length;while(P--){if(R[P] in M.map){break}}if(P===-1){k=false}}if(M.map["data-mce-bogus"]){k=false}}if(k){n.start(H,M,N)}}else{k=false}if(A=J[H]){A.lastIndex=F=g.index+g[0].length;if(g=A.exec(D)){if(k){B=D.substr(F,g.index-F)}F=g.index+g[0].length}else{B=D.substr(F);F=D.length}if(k&&B.length>0){n.text(B,true)}if(k){n.end(H)}l.lastIndex=F;continue}if(!N){if(!Q||Q.indexOf("/")!=Q.length-1){z.push({name:H,valid:k})}else{if(k){n.end(H)}}}}else{if(H=g[1]){n.comment(H)}else{if(H=g[2]){n.cdata(H)}else{if(H=g[3]){n.doctype(H)}else{if(H=g[4]){n.pi(H,g[5])}}}}}}F=g.index+g[0].length}if(F<D.length){n.text(j(D.substr(F)))}for(P=z.length-1;P>=0;P--){H=z[P];if(H.valid){n.end(H.name)}}}}})(tinymce);(function(d){var c=/^[ \t\r\n]*$/,e={"#text":3,"#comment":8,"#cdata":4,"#pi":7,"#doctype":10,"#document-fragment":11};function a(k,l,j){var i,h,f=j?"lastChild":"firstChild",g=j?"prev":"next";if(k[f]){return k[f]}if(k!==l){i=k[g];if(i){return i}for(h=k.parent;h&&h!==l;h=h.parent){i=h[g];if(i){return i}}}}function b(f,g){this.name=f;this.type=g;if(g===1){this.attributes=[];this.attributes.map={}}}d.extend(b.prototype,{replace:function(g){var f=this;if(g.parent){g.remove()}f.insert(g,f);f.remove();return f},attr:function(h,l){var f=this,g,j,k;if(typeof h!=="string"){for(j in h){f.attr(j,h[j])}return f}if(g=f.attributes){if(l!==k){if(l===null){if(h in g.map){delete g.map[h];j=g.length;while(j--){if(g[j].name===h){g=g.splice(j,1);return f}}}return f}if(h in g.map){j=g.length;while(j--){if(g[j].name===h){g[j].value=l;break}}}else{g.push({name:h,value:l})}g.map[h]=l;return f}else{return g.map[h]}}},clone:function(){var g=this,n=new b(g.name,g.type),h,f,m,j,k;if(m=g.attributes){k=[];k.map={};for(h=0,f=m.length;h<f;h++){j=m[h];if(j.name!=="id"){k[k.length]={name:j.name,value:j.value};k.map[j.name]=j.value}}n.attributes=k}n.value=g.value;n.shortEnded=g.shortEnded;return n},wrap:function(g){var f=this;f.parent.insert(g,f);g.append(f);return f},unwrap:function(){var f=this,h,g;for(h=f.firstChild;h;){g=h.next;f.insert(h,f,true);h=g}f.remove()},remove:function(){var f=this,h=f.parent,g=f.next,i=f.prev;if(h){if(h.firstChild===f){h.firstChild=g;if(g){g.prev=null}}else{i.next=g}if(h.lastChild===f){h.lastChild=i;if(i){i.next=null}}else{g.prev=i}f.parent=f.next=f.prev=null}return f},append:function(h){var f=this,g;if(h.parent){h.remove()}g=f.lastChild;if(g){g.next=h;h.prev=g;f.lastChild=h}else{f.lastChild=f.firstChild=h}h.parent=f;return h},insert:function(h,f,i){var g;if(h.parent){h.remove()}g=f.parent||this;if(i){if(f===g.firstChild){g.firstChild=h}else{f.prev.next=h}h.prev=f.prev;h.next=f;f.prev=h}else{if(f===g.lastChild){g.lastChild=h}else{f.next.prev=h}h.next=f.next;h.prev=f;f.next=h}h.parent=g;return h},getAll:function(g){var f=this,h,i=[];for(h=f.firstChild;h;h=a(h,f)){if(h.name===g){i.push(h)}}return i},empty:function(){var g=this,f,h,j;if(g.firstChild){f=[];for(j=g.firstChild;j;j=a(j,g)){f.push(j)}h=f.length;while(h--){j=f[h];j.parent=j.firstChild=j.lastChild=j.next=j.prev=null}}g.firstChild=g.lastChild=null;return g},isEmpty:function(k){var f=this,j=f.firstChild,h,g;if(j){do{if(j.type===1){if(j.attributes.map["data-mce-bogus"]){continue}if(k[j.name]){return false}h=j.attributes.length;while(h--){g=j.attributes[h].name;if(g==="name"||g.indexOf("data-")===0){return false}}}if((j.type===3&&!c.test(j.value))){return false}}while(j=a(j,f))}return true},walk:function(f){return a(this,null,f)}});d.extend(b,{create:function(g,f){var i,h;i=new b(g,e[g]||1);if(f){for(h in f){i.attr(h,f[h])}}return i}});d.html.Node=b})(tinymce);(function(b){var a=b.html.Node;b.html.DomParser=function(g,h){var f=this,e={},d=[],i={},c={};g=g||{};g.validate="validate" in g?g.validate:true;g.root_name=g.root_name||"body";f.schema=h=h||new b.html.Schema();function j(m){var o,p,x,v,z,n,q,l,t,u,k,s,y,r;s=b.makeMap("tr,td,th,tbody,thead,tfoot,table");k=h.getNonEmptyElements();for(o=0;o<m.length;o++){p=m[o];if(!p.parent){continue}v=[p];for(x=p.parent;x&&!h.isValidChild(x.name,p.name)&&!s[x.name];x=x.parent){v.push(x)}if(x&&v.length>1){v.reverse();z=n=f.filterNode(v[0].clone());for(t=0;t<v.length-1;t++){if(h.isValidChild(n.name,v[t].name)){q=f.filterNode(v[t].clone());n.append(q)}else{q=n}for(l=v[t].firstChild;l&&l!=v[t+1];){r=l.next;q.append(l);l=r}n=q}if(!z.isEmpty(k)){x.insert(z,v[0],true);x.insert(p,z)}else{x.insert(p,v[0],true)}x=v[0];if(x.isEmpty(k)||x.firstChild===x.lastChild&&x.firstChild.name==="br"){x.empty().remove()}}else{if(p.parent){if(p.name==="li"){y=p.prev;if(y&&(y.name==="ul"||y.name==="ul")){y.append(p);continue}y=p.next;if(y&&(y.name==="ul"||y.name==="ul")){y.insert(p,y.firstChild,true);continue}p.wrap(f.filterNode(new a("ul",1)));continue}if(h.isValidChild(p.parent.name,"div")&&h.isValidChild("div",p.name)){p.wrap(f.filterNode(new a("div",1)))}else{if(p.name==="style"||p.name==="script"){p.empty().remove()}else{p.unwrap()}}}}}}f.filterNode=function(m){var l,k,n;if(k in e){n=i[k];if(n){n.push(m)}else{i[k]=[m]}}l=d.length;while(l--){k=d[l].name;if(k in m.attributes.map){n=c[k];if(n){n.push(m)}else{c[k]=[m]}}}return m};f.addNodeFilter=function(k,l){b.each(b.explode(k),function(m){var n=e[m];if(!n){e[m]=n=[]}n.push(l)})};f.addAttributeFilter=function(k,l){b.each(b.explode(k),function(m){var n;for(n=0;n<d.length;n++){if(d[n].name===m){d[n].callbacks.push(l);return}}d.push({name:m,callbacks:[l]})})};f.parse=function(v,m){var n,H,A,z,C,B,x,r,E,K,y,o,D,J=[],t,k,s,p,u,q;m=m||{};i={};c={};o=b.extend(b.makeMap("script,style,head,html,body,title,meta,param"),h.getBlockElements());u=h.getNonEmptyElements();p=h.children;y=g.validate;q="forced_root_block" in m?m.forced_root_block:g.forced_root_block;s=h.getWhiteSpaceElements();D=/^[ \t\r\n]+/;t=/[ \t\r\n]+$/;k=/[ \t\r\n]+/g;function F(){var L=H.firstChild,l,M;while(L){l=L.next;if(L.type==3||(L.type==1&&L.name!=="p"&&!o[L.name]&&!L.attr("data-mce-type"))){if(!M){M=I(q,1);H.insert(M,L);M.append(L)}else{M.append(L)}}else{M=null}L=l}}function I(l,L){var M=new a(l,L),N;if(l in e){N=i[l];if(N){N.push(M)}else{i[l]=[M]}}return M}function G(M){var N,l,L;for(N=M.prev;N&&N.type===3;){l=N.value.replace(t,"");if(l.length>0){N.value=l;N=N.prev}else{L=N.prev;N.remove();N=L}}}n=new b.html.SaxParser({validate:y,fix_self_closing:!y,cdata:function(l){A.append(I("#cdata",4)).value=l},text:function(M,l){var L;if(!s[A.name]){M=M.replace(k," ");if(A.lastChild&&o[A.lastChild.name]){M=M.replace(D,"")}}if(M.length!==0){L=I("#text",3);L.raw=!!l;A.append(L).value=M}},comment:function(l){A.append(I("#comment",8)).value=l},pi:function(l,L){A.append(I(l,7)).value=L;G(A)},doctype:function(L){var l;l=A.append(I("#doctype",10));l.value=L;G(A)},start:function(l,T,M){var R,O,N,L,P,U,S,Q;N=y?h.getElementRule(l):{};if(N){R=I(N.outputName||l,1);R.attributes=T;R.shortEnded=M;A.append(R);Q=p[A.name];if(Q&&p[R.name]&&!Q[R.name]){J.push(R)}O=d.length;while(O--){P=d[O].name;if(P in T.map){E=c[P];if(E){E.push(R)}else{c[P]=[R]}}}if(o[l]){G(R)}if(!M){A=R}}},end:function(l){var P,M,O,L,N;M=y?h.getElementRule(l):{};if(M){if(o[l]){if(!s[A.name]){for(P=A.firstChild;P&&P.type===3;){O=P.value.replace(D,"");if(O.length>0){P.value=O;P=P.next}else{L=P.next;P.remove();P=L}}for(P=A.lastChild;P&&P.type===3;){O=P.value.replace(t,"");if(O.length>0){P.value=O;P=P.prev}else{L=P.prev;P.remove();P=L}}}P=A.prev;if(P&&P.type===3){O=P.value.replace(D,"");if(O.length>0){P.value=O}else{P.remove()}}}if(M.removeEmpty||M.paddEmpty){if(A.isEmpty(u)){if(M.paddEmpty){A.empty().append(new a("#text","3")).value="\u00a0"}else{if(!A.attributes.map.name){N=A.parent;A.empty().remove();A=N;return}}}}A=A.parent}}},h);H=A=new a(m.context||g.root_name,11);n.parse(v);if(y&&J.length){if(!m.context){j(J)}else{m.invalid=true}}if(q&&H.name=="body"){F()}if(!m.invalid){for(K in i){E=e[K];z=i[K];x=z.length;while(x--){if(!z[x].parent){z.splice(x,1)}}for(C=0,B=E.length;C<B;C++){E[C](z,K,m)}}for(C=0,B=d.length;C<B;C++){E=d[C];if(E.name in c){z=c[E.name];x=z.length;while(x--){if(!z[x].parent){z.splice(x,1)}}for(x=0,r=E.callbacks.length;x<r;x++){E.callbacks[x](z,E.name,m)}}}}return H};if(g.remove_trailing_brs){f.addNodeFilter("br",function(n,m){var r,q=n.length,o,u=h.getBlockElements(),k=h.getNonEmptyElements(),s,p,t;u.body=1;for(r=0;r<q;r++){o=n[r];s=o.parent;if(u[o.parent.name]&&o===s.lastChild){p=o.prev;while(p){t=p.name;if(t!=="span"||p.attr("data-mce-type")!=="bookmark"){if(t!=="br"){break}if(t==="br"){o=null;break}}p=p.prev}if(o){o.remove();if(s.isEmpty(k)){elementRule=h.getElementRule(s.name);if(elementRule){if(elementRule.removeEmpty){s.remove()}else{if(elementRule.paddEmpty){s.empty().append(new b.html.Node("#text",3)).value="\u00a0"}}}}}}}})}}})(tinymce);tinymce.html.Writer=function(e){var c=[],a,b,d,f,g;e=e||{};a=e.indent;b=tinymce.makeMap(e.indent_before||"");d=tinymce.makeMap(e.indent_after||"");f=tinymce.html.Entities.getEncodeFunc(e.entity_encoding||"raw",e.entities);g=e.element_format=="html";return{start:function(m,k,p){var n,j,h,o;if(a&&b[m]&&c.length>0){o=c[c.length-1];if(o.length>0&&o!=="\n"){c.push("\n")}}c.push("<",m);if(k){for(n=0,j=k.length;n<j;n++){h=k[n];c.push(" ",h.name,'="',f(h.value,true),'"')}}if(!p||g){c[c.length]=">"}else{c[c.length]=" />"}if(p&&a&&d[m]&&c.length>0){o=c[c.length-1];if(o.length>0&&o!=="\n"){c.push("\n")}}},end:function(h){var i;c.push("</",h,">");if(a&&d[h]&&c.length>0){i=c[c.length-1];if(i.length>0&&i!=="\n"){c.push("\n")}}},text:function(i,h){if(i.length>0){c[c.length]=h?i:f(i)}},cdata:function(h){c.push("<![CDATA[",h,"]]>")},comment:function(h){c.push("<!--",h,"-->")},pi:function(h,i){if(i){c.push("<?",h," ",i,"?>")}else{c.push("<?",h,"?>")}if(a){c.push("\n")}},doctype:function(h){c.push("<!DOCTYPE",h,">",a?"\n":"")},reset:function(){c.length=0},getContent:function(){return c.join("").replace(/\n$/,"")}}};(function(a){a.html.Serializer=function(c,d){var b=this,e=new a.html.Writer(c);c=c||{};c.validate="validate" in c?c.validate:true;b.schema=d=d||new a.html.Schema();b.writer=e;b.serialize=function(h){var g,i;i=c.validate;g={3:function(k,j){e.text(k.value,k.raw)},8:function(j){e.comment(j.value)},7:function(j){e.pi(j.name,j.value)},10:function(j){e.doctype(j.value)},4:function(j){e.cdata(j.value)},11:function(j){if((j=j.firstChild)){do{f(j)}while(j=j.next)}}};e.reset();function f(k){var t=g[k.type],j,o,s,r,p,u,n,m,q;if(!t){j=k.name;o=k.shortEnded;s=k.attributes;if(i&&s&&s.length>1){u=[];u.map={};q=d.getElementRule(k.name);for(n=0,m=q.attributesOrder.length;n<m;n++){r=q.attributesOrder[n];if(r in s.map){p=s.map[r];u.map[r]=p;u.push({name:r,value:p})}}for(n=0,m=s.length;n<m;n++){r=s[n].name;if(!(r in u.map)){p=s.map[r];u.map[r]=p;u.push({name:r,value:p})}}s=u}e.start(k.name,s,o);if(!o){if((k=k.firstChild)){do{f(k)}while(k=k.next)}e.end(j)}}else{t(k)}}if(h.type==1&&!c.inner){f(h)}else{g[11](h)}return e.getContent()}}})(tinymce);(function(h){var f=h.each,e=h.is,d=h.isWebKit,b=h.isIE,c=h.html.Entities,a=/^([a-z0-9],?)+$/i,g=h.html.Schema.blockElementsMap,i=/^[ \t\r\n]*$/;h.create("tinymce.dom.DOMUtils",{doc:null,root:null,files:null,pixelStyles:/^(top|left|bottom|right|width|height|borderWidth)$/,props:{"for":"htmlFor","class":"className",className:"className",checked:"checked",disabled:"disabled",maxlength:"maxLength",readonly:"readOnly",selected:"selected",value:"value",id:"id",name:"name",type:"type"},DOMUtils:function(o,m){var l=this,j,k;l.doc=o;l.win=window;l.files={};l.cssFlicker=false;l.counter=0;l.stdMode=!h.isIE||o.documentMode>=8;l.boxModel=!h.isIE||o.compatMode=="CSS1Compat"||l.stdMode;l.hasOuterHTML="outerHTML" in o.createElement("a");l.settings=m=h.extend({keep_values:false,hex_colors:1},m);l.schema=m.schema;l.styles=new h.html.Styles({url_converter:m.url_converter,url_converter_scope:m.url_converter_scope},m.schema);if(h.isIE6){try{o.execCommand("BackgroundImageCache",false,true)}catch(n){l.cssFlicker=true}}if(b&&m.schema){("abbr article aside audio canvas details figcaption figure footer header hgroup mark menu meter nav output progress section summary time video").replace(/\w+/g,function(p){o.createElement(p)});for(k in m.schema.getCustomElements()){o.createElement(k)}}h.addUnload(l.destroy,l)},getRoot:function(){var j=this,k=j.settings;return(k&&j.get(k.root_element))||j.doc.body},getViewPort:function(k){var l,j;k=!k?this.win:k;l=k.document;j=this.boxModel?l.documentElement:l.body;return{x:k.pageXOffset||j.scrollLeft,y:k.pageYOffset||j.scrollTop,w:k.innerWidth||j.clientWidth,h:k.innerHeight||j.clientHeight}},getRect:function(m){var l,j=this,k;m=j.get(m);l=j.getPos(m);k=j.getSize(m);return{x:l.x,y:l.y,w:k.w,h:k.h}},getSize:function(m){var k=this,j,l;m=k.get(m);j=k.getStyle(m,"width");l=k.getStyle(m,"height");if(j.indexOf("px")===-1){j=0}if(l.indexOf("px")===-1){l=0}return{w:parseInt(j)||m.offsetWidth||m.clientWidth,h:parseInt(l)||m.offsetHeight||m.clientHeight}},getParent:function(l,k,j){return this.getParents(l,k,j,false)},getParents:function(u,p,l,s){var k=this,j,m=k.settings,q=[];u=k.get(u);s=s===undefined;if(m.strict_root){l=l||k.getRoot()}if(e(p,"string")){j=p;if(p==="*"){p=function(o){return o.nodeType==1}}else{p=function(o){return k.is(o,j)}}}while(u){if(u==l||!u.nodeType||u.nodeType===9){break}if(!p||p(u)){if(s){q.push(u)}else{return u}}u=u.parentNode}return s?q:null},get:function(j){var k;if(j&&this.doc&&typeof(j)=="string"){k=j;j=this.doc.getElementById(j);if(j&&j.id!==k){return this.doc.getElementsByName(k)[1]}}return j},getNext:function(k,j){return this._findSib(k,j,"nextSibling")},getPrev:function(k,j){return this._findSib(k,j,"previousSibling")},select:function(l,k){var j=this;return h.dom.Sizzle(l,j.get(k)||j.get(j.settings.root_element)||j.doc,[])},is:function(l,j){var k;if(l.length===undefined){if(j==="*"){return l.nodeType==1}if(a.test(j)){j=j.toLowerCase().split(/,/);l=l.nodeName.toLowerCase();for(k=j.length-1;k>=0;k--){if(j[k]==l){return true}}return false}}return h.dom.Sizzle.matches(j,l.nodeType?[l]:l).length>0},add:function(m,q,j,l,o){var k=this;return this.run(m,function(s){var r,n;r=e(q,"string")?k.doc.createElement(q):q;k.setAttribs(r,j);if(l){if(l.nodeType){r.appendChild(l)}else{k.setHTML(r,l)}}return !o?s.appendChild(r):r})},create:function(l,j,k){return this.add(this.doc.createElement(l),l,j,k,1)},createHTML:function(r,j,p){var q="",m=this,l;q+="<"+r;for(l in j){if(j.hasOwnProperty(l)){q+=" "+l+'="'+m.encode(j[l])+'"'}}if(typeof(p)!="undefined"){return q+">"+p+"</"+r+">"}return q+" />"},remove:function(j,k){return this.run(j,function(m){var n,l=m.parentNode;if(!l){return null}if(k){while(n=m.firstChild){if(!h.isIE||n.nodeType!==3||n.nodeValue){l.insertBefore(n,m)}else{m.removeChild(n)}}}return l.removeChild(m)})},setStyle:function(m,j,k){var l=this;return l.run(m,function(p){var o,n;o=p.style;j=j.replace(/-(\D)/g,function(r,q){return q.toUpperCase()});if(l.pixelStyles.test(j)&&(h.is(k,"number")||/^[\-0-9\.]+$/.test(k))){k+="px"}switch(j){case"opacity":if(b){o.filter=k===""?"":"alpha(opacity="+(k*100)+")";if(!m.currentStyle||!m.currentStyle.hasLayout){o.display="inline-block"}}o[j]=o["-moz-opacity"]=o["-khtml-opacity"]=k||"";break;case"float":b?o.styleFloat=k:o.cssFloat=k;break;default:o[j]=k||""}if(l.settings.update_styles){l.setAttrib(p,"data-mce-style")}})},getStyle:function(m,j,l){m=this.get(m);if(!m){return}if(this.doc.defaultView&&l){j=j.replace(/[A-Z]/g,function(n){return"-"+n});try{return this.doc.defaultView.getComputedStyle(m,null).getPropertyValue(j)}catch(k){return null}}j=j.replace(/-(\D)/g,function(o,n){return n.toUpperCase()});if(j=="float"){j=b?"styleFloat":"cssFloat"}if(m.currentStyle&&l){return m.currentStyle[j]}return m.style?m.style[j]:undefined},setStyles:function(m,n){var k=this,l=k.settings,j;j=l.update_styles;l.update_styles=0;f(n,function(o,p){k.setStyle(m,p,o)});l.update_styles=j;if(l.update_styles){k.setAttrib(m,l.cssText)}},removeAllAttribs:function(j){return this.run(j,function(m){var l,k=m.attributes;for(l=k.length-1;l>=0;l--){m.removeAttributeNode(k.item(l))}})},setAttrib:function(l,m,j){var k=this;if(!l||!m){return}if(k.settings.strict){m=m.toLowerCase()}return this.run(l,function(o){var n=k.settings;if(j!==null){switch(m){case"style":if(!e(j,"string")){f(j,function(p,q){k.setStyle(o,q,p)});return}if(n.keep_values){if(j&&!k._isRes(j)){o.setAttribute("data-mce-style",j,2)}else{o.removeAttribute("data-mce-style",2)}}o.style.cssText=j;break;case"class":o.className=j||"";break;case"src":case"href":if(n.keep_values){if(n.url_converter){j=n.url_converter.call(n.url_converter_scope||k,j,m,o)}k.setAttrib(o,"data-mce-"+m,j,2)}break;case"shape":o.setAttribute("data-mce-style",j);break}}if(e(j)&&j!==null&&j.length!==0){o.setAttribute(m,""+j,2)}else{o.removeAttribute(m,2)}})},setAttribs:function(k,l){var j=this;return this.run(k,function(m){f(l,function(o,p){j.setAttrib(m,p,o)})})},getAttrib:function(o,p,l){var j,k=this,m;o=k.get(o);if(!o||o.nodeType!==1){return l===m?false:l}if(!e(l)){l=""}if(/^(src|href|style|coords|shape)$/.test(p)){j=o.getAttribute("data-mce-"+p);if(j){return j}}if(b&&k.props[p]){j=o[k.props[p]];j=j&&j.nodeValue?j.nodeValue:j}if(!j){j=o.getAttribute(p,2)}if(/^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noshade|nowrap|readonly|selected)$/.test(p)){if(o[k.props[p]]===true&&j===""){return p}return j?p:""}if(o.nodeName==="FORM"&&o.getAttributeNode(p)){return o.getAttributeNode(p).nodeValue}if(p==="style"){j=j||o.style.cssText;if(j){j=k.serializeStyle(k.parseStyle(j),o.nodeName);if(k.settings.keep_values&&!k._isRes(j)){o.setAttribute("data-mce-style",j)}}}if(d&&p==="class"&&j){j=j.replace(/(apple|webkit)\-[a-z\-]+/gi,"")}if(b){switch(p){case"rowspan":case"colspan":if(j===1){j=""}break;case"size":if(j==="+0"||j===20||j===0){j=""}break;case"width":case"height":case"vspace":case"checked":case"disabled":case"readonly":if(j===0){j=""}break;case"hspace":if(j===-1){j=""}break;case"maxlength":case"tabindex":if(j===32768||j===2147483647||j==="32768"){j=""}break;case"multiple":case"compact":case"noshade":case"nowrap":if(j===65535){return p}return l;case"shape":j=j.toLowerCase();break;default:if(p.indexOf("on")===0&&j){j=h._replace(/^function\s+\w+\(\)\s+\{\s+(.*)\s+\}$/,"$1",""+j)}}}return(j!==m&&j!==null&&j!=="")?""+j:l},getPos:function(s,m){var k=this,j=0,q=0,o,p=k.doc,l;s=k.get(s);m=m||p.body;if(s){if(s.getBoundingClientRect){s=s.getBoundingClientRect();o=k.boxModel?p.documentElement:p.body;j=s.left+(p.documentElement.scrollLeft||p.body.scrollLeft)-o.clientTop;q=s.top+(p.documentElement.scrollTop||p.body.scrollTop)-o.clientLeft;return{x:j,y:q}}l=s;while(l&&l!=m&&l.nodeType){j+=l.offsetLeft||0;q+=l.offsetTop||0;l=l.offsetParent}l=s.parentNode;while(l&&l!=m&&l.nodeType){j-=l.scrollLeft||0;q-=l.scrollTop||0;l=l.parentNode}}return{x:j,y:q}},parseStyle:function(j){return this.styles.parse(j)},serializeStyle:function(k,j){return this.styles.serialize(k,j)},loadCSS:function(j){var l=this,m=l.doc,k;if(!j){j=""}k=l.select("head")[0];f(j.split(","),function(n){var o;if(l.files[n]){return}l.files[n]=true;o=l.create("link",{rel:"stylesheet",href:h._addVer(n)});if(b&&m.documentMode&&m.recalc){o.onload=function(){if(m.recalc){m.recalc()}o.onload=null}}k.appendChild(o)})},addClass:function(j,k){return this.run(j,function(l){var m;if(!k){return 0}if(this.hasClass(l,k)){return l.className}m=this.removeClass(l,k);return l.className=(m!=""?(m+" "):"")+k})},removeClass:function(l,m){var j=this,k;return j.run(l,function(o){var n;if(j.hasClass(o,m)){if(!k){k=new RegExp("(^|\\s+)"+m+"(\\s+|$)","g")}n=o.className.replace(k," ");n=h.trim(n!=" "?n:"");o.className=n;if(!n){o.removeAttribute("class");o.removeAttribute("className")}return n}return o.className})},hasClass:function(k,j){k=this.get(k);if(!k||!j){return false}return(" "+k.className+" ").indexOf(" "+j+" ")!==-1},show:function(j){return this.setStyle(j,"display","block")},hide:function(j){return this.setStyle(j,"display","none")},isHidden:function(j){j=this.get(j);return !j||j.style.display=="none"||this.getStyle(j,"display")=="none"},uniqueId:function(j){return(!j?"mce_":j)+(this.counter++)},setHTML:function(l,k){var j=this;return j.run(l,function(n){if(b){while(n.firstChild){n.removeChild(n.firstChild)}try{n.innerHTML="<br />"+k;n.removeChild(n.firstChild)}catch(m){n=j.create("div");n.innerHTML="<br />"+k;f(n.childNodes,function(p,o){if(o){n.appendChild(p)}})}}else{n.innerHTML=k}return k})},getOuterHTML:function(l){var k,j=this;l=j.get(l);if(!l){return null}if(l.nodeType===1&&j.hasOuterHTML){return l.outerHTML}k=(l.ownerDocument||j.doc).createElement("body");k.appendChild(l.cloneNode(true));return k.innerHTML},setOuterHTML:function(m,k,n){var j=this;function l(p,o,r){var s,q;q=r.createElement("body");q.innerHTML=o;s=q.lastChild;while(s){j.insertAfter(s.cloneNode(true),p);s=s.previousSibling}j.remove(p)}return this.run(m,function(p){p=j.get(p);if(p.nodeType==1){n=n||p.ownerDocument||j.doc;if(b){try{if(b&&p.nodeType==1){p.outerHTML=k}else{l(p,k,n)}}catch(o){l(p,k,n)}}else{l(p,k,n)}}})},decode:c.decode,encode:c.encodeAllRaw,insertAfter:function(j,k){k=this.get(k);return this.run(j,function(m){var l,n;l=k.parentNode;n=k.nextSibling;if(n){l.insertBefore(m,n)}else{l.appendChild(m)}return m})},isBlock:function(k){var j=k.nodeType;if(j){return !!(j===1&&g[k.nodeName])}return !!g[k]},replace:function(p,m,j){var l=this;if(e(m,"array")){p=p.cloneNode(true)}return l.run(m,function(k){if(j){f(h.grep(k.childNodes),function(n){p.appendChild(n)})}return k.parentNode.replaceChild(p,k)})},rename:function(m,j){var l=this,k;if(m.nodeName!=j.toUpperCase()){k=l.create(j);f(l.getAttribs(m),function(n){l.setAttrib(k,n.nodeName,l.getAttrib(m,n.nodeName))});l.replace(k,m,1)}return k||m},findCommonAncestor:function(l,j){var m=l,k;while(m){k=j;while(k&&m!=k){k=k.parentNode}if(m==k){break}m=m.parentNode}if(!m&&l.ownerDocument){return l.ownerDocument.documentElement}return m},toHex:function(j){var l=/^\s*rgb\s*?\(\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?\)\s*$/i.exec(j);function k(m){m=parseInt(m).toString(16);return m.length>1?m:"0"+m}if(l){j="#"+k(l[1])+k(l[2])+k(l[3]);return j}return j},getClasses:function(){var n=this,j=[],m,o={},p=n.settings.class_filter,l;if(n.classes){return n.classes}function q(r){f(r.imports,function(s){q(s)});f(r.cssRules||r.rules,function(s){switch(s.type||1){case 1:if(s.selectorText){f(s.selectorText.split(","),function(t){t=t.replace(/^\s*|\s*$|^\s\./g,"");if(/\.mce/.test(t)||!/\.[\w\-]+$/.test(t)){return}l=t;t=h._replace(/.*\.([a-z0-9_\-]+).*/i,"$1",t);if(p&&!(t=p(t,l))){return}if(!o[t]){j.push({"class":t});o[t]=1}})}break;case 3:q(s.styleSheet);break}})}try{f(n.doc.styleSheets,q)}catch(k){}if(j.length>0){n.classes=j}return j},run:function(m,l,k){var j=this,n;if(j.doc&&typeof(m)==="string"){m=j.get(m)}if(!m){return false}k=k||this;if(!m.nodeType&&(m.length||m.length===0)){n=[];f(m,function(p,o){if(p){if(typeof(p)=="string"){p=j.doc.getElementById(p)}n.push(l.call(k,p,o))}});return n}return l.call(k,m)},getAttribs:function(k){var j;k=this.get(k);if(!k){return[]}if(b){j=[];if(k.nodeName=="OBJECT"){return k.attributes}if(k.nodeName==="OPTION"&&this.getAttrib(k,"selected")){j.push({specified:1,nodeName:"selected"})}k.cloneNode(false).outerHTML.replace(/<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi,"").replace(/[\w:\-]+/gi,function(l){j.push({specified:1,nodeName:l})});return j}return k.attributes},isEmpty:function(m,k){var r=this,o,n,q,j,l,p;m=m.firstChild;if(m){j=new h.dom.TreeWalker(m);k=k||r.schema?r.schema.getNonEmptyElements():null;do{q=m.nodeType;if(q===1){if(m.getAttribute("data-mce-bogus")){continue}l=m.nodeName.toLowerCase();if(k&&k[l]){p=m.parentNode;if(l==="br"&&r.isBlock(p)&&p.firstChild===m&&p.lastChild===m){continue}return false}n=r.getAttribs(m);o=m.attributes.length;while(o--){l=m.attributes[o].nodeName;if(l==="name"||l==="data-mce-bookmark"){return false}}}if((q===3&&!i.test(m.nodeValue))){return false}}while(m=j.next())}return true},destroy:function(k){var j=this;if(j.events){j.events.destroy()}j.win=j.doc=j.root=j.events=null;if(!k){h.removeUnload(j.destroy)}},createRng:function(){var j=this.doc;return j.createRange?j.createRange():new h.dom.Range(this)},nodeIndex:function(n,o){var j=0,l,m,k;if(n){for(l=n.nodeType,n=n.previousSibling,m=n;n;n=n.previousSibling){k=n.nodeType;if(o&&k==3){if(k==l||!n.nodeValue.length){continue}}j++;l=k}}return j},split:function(n,m,q){var s=this,j=s.createRng(),o,l,p;function k(v){var t,r=v.childNodes,u=v.nodeType;if(u==1&&v.getAttribute("data-mce-type")=="bookmark"){return}for(t=r.length-1;t>=0;t--){k(r[t])}if(u!=9){if(u==3&&v.nodeValue.length>0){if(!s.isBlock(v.parentNode)||h.trim(v.nodeValue).length>0){return}}else{if(u==1){r=v.childNodes;if(r.length==1&&r[0]&&r[0].nodeType==1&&r[0].getAttribute("data-mce-type")=="bookmark"){v.parentNode.insertBefore(r[0],v)}if(r.length||/^(br|hr|input|img)$/i.test(v.nodeName)){return}}}s.remove(v)}return v}if(n&&m){j.setStart(n.parentNode,s.nodeIndex(n));j.setEnd(m.parentNode,s.nodeIndex(m));o=j.extractContents();j=s.createRng();j.setStart(m.parentNode,s.nodeIndex(m)+1);j.setEnd(n.parentNode,s.nodeIndex(n)+1);l=j.extractContents();p=n.parentNode;p.insertBefore(k(o),n);if(q){p.replaceChild(q,m)}else{p.insertBefore(m,n)}p.insertBefore(k(l),n);s.remove(n);return q||m}},bind:function(n,j,m,l){var k=this;if(!k.events){k.events=new h.dom.EventUtils()}return k.events.add(n,j,m,l||this)},unbind:function(m,j,l){var k=this;if(!k.events){k.events=new h.dom.EventUtils()}return k.events.remove(m,j,l)},_findSib:function(m,j,k){var l=this,n=j;if(m){if(e(n,"string")){n=function(o){return l.is(o,j)}}for(m=m[k];m;m=m[k]){if(n(m)){return m}}}return null},_isRes:function(j){return/^(top|left|bottom|right|width|height)/i.test(j)||/;\s*(top|left|bottom|right|width|height)/i.test(j)}});h.DOM=new h.dom.DOMUtils(document,{process_html:0})})(tinymce);(function(a){function b(c){var N=this,e=c.doc,S=0,E=1,j=2,D=true,R=false,U="startOffset",h="startContainer",P="endContainer",z="endOffset",k=tinymce.extend,n=c.nodeIndex;k(N,{startContainer:e,startOffset:0,endContainer:e,endOffset:0,collapsed:D,commonAncestorContainer:e,START_TO_START:0,START_TO_END:1,END_TO_END:2,END_TO_START:3,setStart:q,setEnd:s,setStartBefore:g,setStartAfter:I,setEndBefore:J,setEndAfter:u,collapse:A,selectNode:x,selectNodeContents:F,compareBoundaryPoints:v,deleteContents:p,extractContents:H,cloneContents:d,insertNode:C,surroundContents:M,cloneRange:K});function q(V,t){B(D,V,t)}function s(V,t){B(R,V,t)}function g(t){q(t.parentNode,n(t))}function I(t){q(t.parentNode,n(t)+1)}function J(t){s(t.parentNode,n(t))}function u(t){s(t.parentNode,n(t)+1)}function A(t){if(t){N[P]=N[h];N[z]=N[U]}else{N[h]=N[P];N[U]=N[z]}N.collapsed=D}function x(t){g(t);u(t)}function F(t){q(t,0);s(t,t.nodeType===1?t.childNodes.length:t.nodeValue.length)}function v(Y,t){var ab=N[h],W=N[U],aa=N[P],V=N[z],Z=t.startContainer,ad=t.startOffset,X=t.endContainer,ac=t.endOffset;if(Y===0){return G(ab,W,Z,ad)}if(Y===1){return G(aa,V,Z,ad)}if(Y===2){return G(aa,V,X,ac)}if(Y===3){return G(ab,W,X,ac)}}function p(){m(j)}function H(){return m(S)}function d(){return m(E)}function C(Y){var V=this[h],t=this[U],X,W;if((V.nodeType===3||V.nodeType===4)&&V.nodeValue){if(!t){V.parentNode.insertBefore(Y,V)}else{if(t>=V.nodeValue.length){c.insertAfter(Y,V)}else{X=V.splitText(t);V.parentNode.insertBefore(Y,X)}}}else{if(V.childNodes.length>0){W=V.childNodes[t]}if(W){V.insertBefore(Y,W)}else{V.appendChild(Y)}}}function M(V){var t=N.extractContents();N.insertNode(V);V.appendChild(t);N.selectNode(V)}function K(){return k(new b(c),{startContainer:N[h],startOffset:N[U],endContainer:N[P],endOffset:N[z],collapsed:N.collapsed,commonAncestorContainer:N.commonAncestorContainer})}function O(t,V){var W;if(t.nodeType==3){return t}if(V<0){return t}W=t.firstChild;while(W&&V>0){--V;W=W.nextSibling}if(W){return W}return t}function l(){return(N[h]==N[P]&&N[U]==N[z])}function G(X,Z,V,Y){var aa,W,t,ab,ad,ac;if(X==V){if(Z==Y){return 0}if(Z<Y){return -1}return 1}aa=V;while(aa&&aa.parentNode!=X){aa=aa.parentNode}if(aa){W=0;t=X.firstChild;while(t!=aa&&W<Z){W++;t=t.nextSibling}if(Z<=W){return -1}return 1}aa=X;while(aa&&aa.parentNode!=V){aa=aa.parentNode}if(aa){W=0;t=V.firstChild;while(t!=aa&&W<Y){W++;t=t.nextSibling}if(W<Y){return -1}return 1}ab=c.findCommonAncestor(X,V);ad=X;while(ad&&ad.parentNode!=ab){ad=ad.parentNode}if(!ad){ad=ab}ac=V;while(ac&&ac.parentNode!=ab){ac=ac.parentNode}if(!ac){ac=ab}if(ad==ac){return 0}t=ab.firstChild;while(t){if(t==ad){return -1}if(t==ac){return 1}t=t.nextSibling}}function B(V,Y,X){var t,W;if(V){N[h]=Y;N[U]=X}else{N[P]=Y;N[z]=X}t=N[P];while(t.parentNode){t=t.parentNode}W=N[h];while(W.parentNode){W=W.parentNode}if(W==t){if(G(N[h],N[U],N[P],N[z])>0){N.collapse(V)}}else{N.collapse(V)}N.collapsed=l();N.commonAncestorContainer=c.findCommonAncestor(N[h],N[P])}function m(ab){var aa,X=0,ad=0,V,Z,W,Y,t,ac;if(N[h]==N[P]){return f(ab)}for(aa=N[P],V=aa.parentNode;V;aa=V,V=V.parentNode){if(V==N[h]){return r(aa,ab)}++X}for(aa=N[h],V=aa.parentNode;V;aa=V,V=V.parentNode){if(V==N[P]){return T(aa,ab)}++ad}Z=ad-X;W=N[h];while(Z>0){W=W.parentNode;Z--}Y=N[P];while(Z<0){Y=Y.parentNode;Z++}for(t=W.parentNode,ac=Y.parentNode;t!=ac;t=t.parentNode,ac=ac.parentNode){W=t;Y=ac}return o(W,Y,ab)}function f(Z){var ab,Y,X,aa,t,W,V;if(Z!=j){ab=e.createDocumentFragment()}if(N[U]==N[z]){return ab}if(N[h].nodeType==3){Y=N[h].nodeValue;X=Y.substring(N[U],N[z]);if(Z!=E){N[h].deleteData(N[U],N[z]-N[U]);N.collapse(D)}if(Z==j){return}ab.appendChild(e.createTextNode(X));return ab}aa=O(N[h],N[U]);t=N[z]-N[U];while(t>0){W=aa.nextSibling;V=y(aa,Z);if(ab){ab.appendChild(V)}--t;aa=W}if(Z!=E){N.collapse(D)}return ab}function r(ab,Y){var aa,Z,V,t,X,W;if(Y!=j){aa=e.createDocumentFragment()}Z=i(ab,Y);if(aa){aa.appendChild(Z)}V=n(ab);t=V-N[U];if(t<=0){if(Y!=E){N.setEndBefore(ab);N.collapse(R)}return aa}Z=ab.previousSibling;while(t>0){X=Z.previousSibling;W=y(Z,Y);if(aa){aa.insertBefore(W,aa.firstChild)}--t;Z=X}if(Y!=E){N.setEndBefore(ab);N.collapse(R)}return aa}function T(Z,Y){var ab,V,aa,t,X,W;if(Y!=j){ab=e.createDocumentFragment()}aa=Q(Z,Y);if(ab){ab.appendChild(aa)}V=n(Z);++V;t=N[z]-V;aa=Z.nextSibling;while(t>0){X=aa.nextSibling;W=y(aa,Y);if(ab){ab.appendChild(W)}--t;aa=X}if(Y!=E){N.setStartAfter(Z);N.collapse(D)}return ab}function o(Z,t,ac){var W,ae,Y,aa,ab,V,ad,X;if(ac!=j){ae=e.createDocumentFragment()}W=Q(Z,ac);if(ae){ae.appendChild(W)}Y=Z.parentNode;aa=n(Z);ab=n(t);++aa;V=ab-aa;ad=Z.nextSibling;while(V>0){X=ad.nextSibling;W=y(ad,ac);if(ae){ae.appendChild(W)}ad=X;--V}W=i(t,ac);if(ae){ae.appendChild(W)}if(ac!=E){N.setStartAfter(Z);N.collapse(D)}return ae}function i(aa,ab){var W=O(N[P],N[z]-1),ac,Z,Y,t,V,X=W!=N[P];if(W==aa){return L(W,X,R,ab)}ac=W.parentNode;Z=L(ac,R,R,ab);while(ac){while(W){Y=W.previousSibling;t=L(W,X,R,ab);if(ab!=j){Z.insertBefore(t,Z.firstChild)}X=D;W=Y}if(ac==aa){return Z}W=ac.previousSibling;ac=ac.parentNode;V=L(ac,R,R,ab);if(ab!=j){V.appendChild(Z)}Z=V}}function Q(aa,ab){var X=O(N[h],N[U]),Y=X!=N[h],ac,Z,W,t,V;if(X==aa){return L(X,Y,D,ab)}ac=X.parentNode;Z=L(ac,R,D,ab);while(ac){while(X){W=X.nextSibling;t=L(X,Y,D,ab);if(ab!=j){Z.appendChild(t)}Y=D;X=W}if(ac==aa){return Z}X=ac.nextSibling;ac=ac.parentNode;V=L(ac,R,D,ab);if(ab!=j){V.appendChild(Z)}Z=V}}function L(t,Y,ab,ac){var X,W,Z,V,aa;if(Y){return y(t,ac)}if(t.nodeType==3){X=t.nodeValue;if(ab){V=N[U];W=X.substring(V);Z=X.substring(0,V)}else{V=N[z];W=X.substring(0,V);Z=X.substring(V)}if(ac!=E){t.nodeValue=Z}if(ac==j){return}aa=t.cloneNode(R);aa.nodeValue=W;return aa}if(ac==j){return}return t.cloneNode(R)}function y(V,t){if(t!=j){return t==E?V.cloneNode(D):V}V.parentNode.removeChild(V)}}a.Range=b})(tinymce.dom);(function(){function a(d){var b=this,h=d.dom,c=true,f=false;function e(i,j){var k,t=0,q,n,m,l,o,r,p=-1,s;k=i.duplicate();k.collapse(j);s=k.parentElement();if(s.ownerDocument!==d.dom.doc){return}while(s.contentEditable==="false"){s=s.parentNode}if(!s.hasChildNodes()){return{node:s,inside:1}}m=s.children;q=m.length-1;while(t<=q){r=Math.floor((t+q)/2);l=m[r];k.moveToElementText(l);p=k.compareEndPoints(j?"StartToStart":"EndToEnd",i);if(p>0){q=r-1}else{if(p<0){t=r+1}else{return{node:l}}}}if(p<0){if(!l){k.moveToElementText(s);k.collapse(true);l=s;n=true}else{k.collapse(false)}k.setEndPoint(j?"EndToStart":"EndToEnd",i);if(k.compareEndPoints(j?"StartToStart":"StartToEnd",i)>0){k=i.duplicate();k.collapse(j);o=-1;while(s==k.parentElement()){if(k.move("character",-1)==0){break}o++}}o=o||k.text.replace("\r\n"," ").length}else{k.collapse(true);k.setEndPoint(j?"StartToStart":"StartToEnd",i);o=k.text.replace("\r\n"," ").length}return{node:l,position:p,offset:o,inside:n}}function g(){var i=d.getRng(),r=h.createRng(),l,k,p,q,m,j;l=i.item?i.item(0):i.parentElement();if(l.ownerDocument!=h.doc){return r}k=d.isCollapsed();if(i.item){r.setStart(l.parentNode,h.nodeIndex(l));r.setEnd(r.startContainer,r.startOffset+1);return r}function o(A){var u=e(i,A),s,y,z=0,x,v,t;s=u.node;y=u.offset;if(u.inside&&!s.hasChildNodes()){r[A?"setStart":"setEnd"](s,0);return}if(y===v){r[A?"setStartBefore":"setEndAfter"](s);return}if(u.position<0){x=u.inside?s.firstChild:s.nextSibling;if(!x){r[A?"setStartAfter":"setEndAfter"](s);return}if(!y){if(x.nodeType==3){r[A?"setStart":"setEnd"](x,0)}else{r[A?"setStartBefore":"setEndBefore"](x)}return}while(x){t=x.nodeValue;z+=t.length;if(z>=y){s=x;z-=y;z=t.length-z;break}x=x.nextSibling}}else{x=s.previousSibling;if(!x){return r[A?"setStartBefore":"setEndBefore"](s)}if(!y){if(s.nodeType==3){r[A?"setStart":"setEnd"](x,s.nodeValue.length)}else{r[A?"setStartAfter":"setEndAfter"](x)}return}while(x){z+=x.nodeValue.length;if(z>=y){s=x;z-=y;break}x=x.previousSibling}}r[A?"setStart":"setEnd"](s,z)}try{o(true);if(!k){o()}}catch(n){if(n.number==-2147024809){m=b.getBookmark(2);p=i.duplicate();p.collapse(true);l=p.parentElement();if(!k){p=i.duplicate();p.collapse(false);q=p.parentElement();q.innerHTML=q.innerHTML}l.innerHTML=l.innerHTML;b.moveToBookmark(m);i=d.getRng();o(true);if(!k){o()}}else{throw n}}return r}this.getBookmark=function(m){var j=d.getRng(),o,i,l={};function n(u){var u,t,p,s,r,q=[];t=u.parentNode;p=h.getRoot().parentNode;while(t!=p&&t.nodeType!==9){s=t.children;r=s.length;while(r--){if(u===s[r]){q.push(r);break}}u=t;t=t.parentNode}return q}function k(q){var p;p=e(j,q);if(p){return{position:p.position,offset:p.offset,indexes:n(p.node),inside:p.inside}}}if(m===2){if(!j.item){l.start=k(true);if(!d.isCollapsed()){l.end=k()}}else{l.start={ctrl:true,indexes:n(j.item(0))}}}return l};this.moveToBookmark=function(k){var j,i=h.doc.body;function m(o){var r,q,n,p;r=h.getRoot();for(q=o.length-1;q>=0;q--){p=r.children;n=o[q];if(n<=p.length-1){r=p[n]}}return r}function l(r){var n=k[r?"start":"end"],q,p,o;if(n){q=n.position>0;p=i.createTextRange();p.moveToElementText(m(n.indexes));offset=n.offset;if(offset!==o){p.collapse(n.inside||q);p.moveStart("character",q?-offset:offset)}else{p.collapse(r)}j.setEndPoint(r?"StartToStart":"EndToStart",p);if(r){j.collapse(true)}}}if(k.start){if(k.start.ctrl){j=i.createControlRange();j.addElement(m(k.start.indexes));j.select()}else{j=i.createTextRange();l(true);l();j.select()}}};this.addRange=function(i){var n,l,k,p,s,q,r=d.dom.doc,m=r.body;function j(z){var u,y,t,x,v;t=h.create("a");u=z?k:s;y=z?p:q;x=n.duplicate();if(u==r||u==r.documentElement){u=m;y=0}if(u.nodeType==3){u.parentNode.insertBefore(t,u);x.moveToElementText(t);x.moveStart("character",y);h.remove(t);n.setEndPoint(z?"StartToStart":"EndToEnd",x)}else{v=u.childNodes;if(v.length){if(y>=v.length){h.insertAfter(t,v[v.length-1])}else{u.insertBefore(t,v[y])}x.moveToElementText(t)}else{t=r.createTextNode("\uFEFF");u.appendChild(t);x.moveToElementText(t.parentNode);x.collapse(c)}n.setEndPoint(z?"StartToStart":"EndToEnd",x);h.remove(t)}}k=i.startContainer;p=i.startOffset;s=i.endContainer;q=i.endOffset;n=m.createTextRange();if(k==s&&k.nodeType==1&&p==q-1){if(p==q-1){try{l=m.createControlRange();l.addElement(k.childNodes[p]);l.select();return}catch(o){}}}j(true);j();n.select()};this.getRangeAt=g}tinymce.dom.TridentSelection=a})();(function(){var p=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,j=0,d=Object.prototype.toString,o=false,i=true;[0,0].sort(function(){i=false;return 0});var b=function(v,e,z,A){z=z||[];e=e||document;var C=e;if(e.nodeType!==1&&e.nodeType!==9){return[]}if(!v||typeof v!=="string"){return z}var x=[],s,E,H,r,u=true,t=b.isXML(e),B=v,D,G,F,y;do{p.exec("");s=p.exec(B);if(s){B=s[3];x.push(s[1]);if(s[2]){r=s[3];break}}}while(s);if(x.length>1&&k.exec(v)){if(x.length===2&&f.relative[x[0]]){E=h(x[0]+x[1],e)}else{E=f.relative[x[0]]?[e]:b(x.shift(),e);while(x.length){v=x.shift();if(f.relative[v]){v+=x.shift()}E=h(v,E)}}}else{if(!A&&x.length>1&&e.nodeType===9&&!t&&f.match.ID.test(x[0])&&!f.match.ID.test(x[x.length-1])){D=b.find(x.shift(),e,t);e=D.expr?b.filter(D.expr,D.set)[0]:D.set[0]}if(e){D=A?{expr:x.pop(),set:a(A)}:b.find(x.pop(),x.length===1&&(x[0]==="~"||x[0]==="+")&&e.parentNode?e.parentNode:e,t);E=D.expr?b.filter(D.expr,D.set):D.set;if(x.length>0){H=a(E)}else{u=false}while(x.length){G=x.pop();F=G;if(!f.relative[G]){G=""}else{F=x.pop()}if(F==null){F=e}f.relative[G](H,F,t)}}else{H=x=[]}}if(!H){H=E}if(!H){b.error(G||v)}if(d.call(H)==="[object Array]"){if(!u){z.push.apply(z,H)}else{if(e&&e.nodeType===1){for(y=0;H[y]!=null;y++){if(H[y]&&(H[y]===true||H[y].nodeType===1&&b.contains(e,H[y]))){z.push(E[y])}}}else{for(y=0;H[y]!=null;y++){if(H[y]&&H[y].nodeType===1){z.push(E[y])}}}}}else{a(H,z)}if(r){b(r,C,z,A);b.uniqueSort(z)}return z};b.uniqueSort=function(r){if(c){o=i;r.sort(c);if(o){for(var e=1;e<r.length;e++){if(r[e]===r[e-1]){r.splice(e--,1)}}}}return r};b.matches=function(e,r){return b(e,null,null,r)};b.find=function(y,e,z){var x;if(!y){return[]}for(var t=0,s=f.order.length;t<s;t++){var v=f.order[t],u;if((u=f.leftMatch[v].exec(y))){var r=u[1];u.splice(1,1);if(r.substr(r.length-1)!=="\\"){u[1]=(u[1]||"").replace(/\\/g,"");x=f.find[v](u,e,z);if(x!=null){y=y.replace(f.match[v],"");break}}}}if(!x){x=e.getElementsByTagName("*")}return{set:x,expr:y}};b.filter=function(C,B,F,u){var s=C,H=[],z=B,x,e,y=B&&B[0]&&b.isXML(B[0]);while(C&&B.length){for(var A in f.filter){if((x=f.leftMatch[A].exec(C))!=null&&x[2]){var r=f.filter[A],G,E,t=x[1];e=false;x.splice(1,1);if(t.substr(t.length-1)==="\\"){continue}if(z===H){H=[]}if(f.preFilter[A]){x=f.preFilter[A](x,z,F,H,u,y);if(!x){e=G=true}else{if(x===true){continue}}}if(x){for(var v=0;(E=z[v])!=null;v++){if(E){G=r(E,x,v,z);var D=u^!!G;if(F&&G!=null){if(D){e=true}else{z[v]=false}}else{if(D){H.push(E);e=true}}}}}if(G!==undefined){if(!F){z=H}C=C.replace(f.match[A],"");if(!e){return[]}break}}}if(C===s){if(e==null){b.error(C)}else{break}}s=C}return z};b.error=function(e){throw"Syntax error, unrecognized expression: "+e};var f=b.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(e){return e.getAttribute("href")}},relative:{"+":function(x,r){var t=typeof r==="string",v=t&&!/\W/.test(r),y=t&&!v;if(v){r=r.toLowerCase()}for(var s=0,e=x.length,u;s<e;s++){if((u=x[s])){while((u=u.previousSibling)&&u.nodeType!==1){}x[s]=y||u&&u.nodeName.toLowerCase()===r?u||false:u===r}}if(y){b.filter(r,x,true)}},">":function(x,r){var u=typeof r==="string",v,s=0,e=x.length;if(u&&!/\W/.test(r)){r=r.toLowerCase();for(;s<e;s++){v=x[s];if(v){var t=v.parentNode;x[s]=t.nodeName.toLowerCase()===r?t:false}}}else{for(;s<e;s++){v=x[s];if(v){x[s]=u?v.parentNode:v.parentNode===r}}if(u){b.filter(r,x,true)}}},"":function(t,r,v){var s=j++,e=q,u;if(typeof r==="string"&&!/\W/.test(r)){r=r.toLowerCase();u=r;e=n}e("parentNode",r,s,t,u,v)},"~":function(t,r,v){var s=j++,e=q,u;if(typeof r==="string"&&!/\W/.test(r)){r=r.toLowerCase();u=r;e=n}e("previousSibling",r,s,t,u,v)}},find:{ID:function(r,s,t){if(typeof s.getElementById!=="undefined"&&!t){var e=s.getElementById(r[1]);return e?[e]:[]}},NAME:function(s,v){if(typeof v.getElementsByName!=="undefined"){var r=[],u=v.getElementsByName(s[1]);for(var t=0,e=u.length;t<e;t++){if(u[t].getAttribute("name")===s[1]){r.push(u[t])}}return r.length===0?null:r}},TAG:function(e,r){return r.getElementsByTagName(e[1])}},preFilter:{CLASS:function(t,r,s,e,x,y){t=" "+t[1].replace(/\\/g,"")+" ";if(y){return t}for(var u=0,v;(v=r[u])!=null;u++){if(v){if(x^(v.className&&(" "+v.className+" ").replace(/[\t\n]/g," ").indexOf(t)>=0)){if(!s){e.push(v)}}else{if(s){r[u]=false}}}}return false},ID:function(e){return e[1].replace(/\\/g,"")},TAG:function(r,e){return r[1].toLowerCase()},CHILD:function(e){if(e[1]==="nth"){var r=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(e[2]==="even"&&"2n"||e[2]==="odd"&&"2n+1"||!/\D/.test(e[2])&&"0n+"+e[2]||e[2]);e[2]=(r[1]+(r[2]||1))-0;e[3]=r[3]-0}e[0]=j++;return e},ATTR:function(u,r,s,e,v,x){var t=u[1].replace(/\\/g,"");if(!x&&f.attrMap[t]){u[1]=f.attrMap[t]}if(u[2]==="~="){u[4]=" "+u[4]+" "}return u},PSEUDO:function(u,r,s,e,v){if(u[1]==="not"){if((p.exec(u[3])||"").length>1||/^\w/.test(u[3])){u[3]=b(u[3],null,null,r)}else{var t=b.filter(u[3],r,s,true^v);if(!s){e.push.apply(e,t)}return false}}else{if(f.match.POS.test(u[0])||f.match.CHILD.test(u[0])){return true}}return u},POS:function(e){e.unshift(true);return e}},filters:{enabled:function(e){return e.disabled===false&&e.type!=="hidden"},disabled:function(e){return e.disabled===true},checked:function(e){return e.checked===true},selected:function(e){e.parentNode.selectedIndex;return e.selected===true},parent:function(e){return !!e.firstChild},empty:function(e){return !e.firstChild},has:function(s,r,e){return !!b(e[3],s).length},header:function(e){return(/h\d/i).test(e.nodeName)},text:function(e){return"text"===e.type},radio:function(e){return"radio"===e.type},checkbox:function(e){return"checkbox"===e.type},file:function(e){return"file"===e.type},password:function(e){return"password"===e.type},submit:function(e){return"submit"===e.type},image:function(e){return"image"===e.type},reset:function(e){return"reset"===e.type},button:function(e){return"button"===e.type||e.nodeName.toLowerCase()==="button"},input:function(e){return(/input|select|textarea|button/i).test(e.nodeName)}},setFilters:{first:function(r,e){return e===0},last:function(s,r,e,t){return r===t.length-1},even:function(r,e){return e%2===0},odd:function(r,e){return e%2===1},lt:function(s,r,e){return r<e[3]-0},gt:function(s,r,e){return r>e[3]-0},nth:function(s,r,e){return e[3]-0===r},eq:function(s,r,e){return e[3]-0===r}},filter:{PSEUDO:function(s,y,x,z){var e=y[1],r=f.filters[e];if(r){return r(s,x,y,z)}else{if(e==="contains"){return(s.textContent||s.innerText||b.getText([s])||"").indexOf(y[3])>=0}else{if(e==="not"){var t=y[3];for(var v=0,u=t.length;v<u;v++){if(t[v]===s){return false}}return true}else{b.error("Syntax error, unrecognized expression: "+e)}}}},CHILD:function(e,t){var x=t[1],r=e;switch(x){case"only":case"first":while((r=r.previousSibling)){if(r.nodeType===1){return false}}if(x==="first"){return true}r=e;case"last":while((r=r.nextSibling)){if(r.nodeType===1){return false}}return true;case"nth":var s=t[2],A=t[3];if(s===1&&A===0){return true}var v=t[0],z=e.parentNode;if(z&&(z.sizcache!==v||!e.nodeIndex)){var u=0;for(r=z.firstChild;r;r=r.nextSibling){if(r.nodeType===1){r.nodeIndex=++u}}z.sizcache=v}var y=e.nodeIndex-A;if(s===0){return y===0}else{return(y%s===0&&y/s>=0)}}},ID:function(r,e){return r.nodeType===1&&r.getAttribute("id")===e},TAG:function(r,e){return(e==="*"&&r.nodeType===1)||r.nodeName.toLowerCase()===e},CLASS:function(r,e){return(" "+(r.className||r.getAttribute("class"))+" ").indexOf(e)>-1},ATTR:function(v,t){var s=t[1],e=f.attrHandle[s]?f.attrHandle[s](v):v[s]!=null?v[s]:v.getAttribute(s),x=e+"",u=t[2],r=t[4];return e==null?u==="!=":u==="="?x===r:u==="*="?x.indexOf(r)>=0:u==="~="?(" "+x+" ").indexOf(r)>=0:!r?x&&e!==false:u==="!="?x!==r:u==="^="?x.indexOf(r)===0:u==="$="?x.substr(x.length-r.length)===r:u==="|="?x===r||x.substr(0,r.length+1)===r+"-":false},POS:function(u,r,s,v){var e=r[2],t=f.setFilters[e];if(t){return t(u,s,r,v)}}}};var k=f.match.POS,g=function(r,e){return"\\"+(e-0+1)};for(var m in f.match){f.match[m]=new RegExp(f.match[m].source+(/(?![^\[]*\])(?![^\(]*\))/.source));f.leftMatch[m]=new RegExp(/(^(?:.|\r|\n)*?)/.source+f.match[m].source.replace(/\\(\d+)/g,g))}var a=function(r,e){r=Array.prototype.slice.call(r,0);if(e){e.push.apply(e,r);return e}return r};try{Array.prototype.slice.call(document.documentElement.childNodes,0)[0].nodeType}catch(l){a=function(u,t){var r=t||[],s=0;if(d.call(u)==="[object Array]"){Array.prototype.push.apply(r,u)}else{if(typeof u.length==="number"){for(var e=u.length;s<e;s++){r.push(u[s])}}else{for(;u[s];s++){r.push(u[s])}}}return r}}var c;if(document.documentElement.compareDocumentPosition){c=function(r,e){if(!r.compareDocumentPosition||!e.compareDocumentPosition){if(r==e){o=true}return r.compareDocumentPosition?-1:1}var s=r.compareDocumentPosition(e)&4?-1:r===e?0:1;if(s===0){o=true}return s}}else{if("sourceIndex" in document.documentElement){c=function(r,e){if(!r.sourceIndex||!e.sourceIndex){if(r==e){o=true}return r.sourceIndex?-1:1}var s=r.sourceIndex-e.sourceIndex;if(s===0){o=true}return s}}else{if(document.createRange){c=function(t,r){if(!t.ownerDocument||!r.ownerDocument){if(t==r){o=true}return t.ownerDocument?-1:1}var s=t.ownerDocument.createRange(),e=r.ownerDocument.createRange();s.setStart(t,0);s.setEnd(t,0);e.setStart(r,0);e.setEnd(r,0);var u=s.compareBoundaryPoints(Range.START_TO_END,e);if(u===0){o=true}return u}}}}b.getText=function(e){var r="",t;for(var s=0;e[s];s++){t=e[s];if(t.nodeType===3||t.nodeType===4){r+=t.nodeValue}else{if(t.nodeType!==8){r+=b.getText(t.childNodes)}}}return r};(function(){var r=document.createElement("div"),s="script"+(new Date()).getTime();r.innerHTML="<a name='"+s+"'/>";var e=document.documentElement;e.insertBefore(r,e.firstChild);if(document.getElementById(s)){f.find.ID=function(u,v,x){if(typeof v.getElementById!=="undefined"&&!x){var t=v.getElementById(u[1]);return t?t.id===u[1]||typeof t.getAttributeNode!=="undefined"&&t.getAttributeNode("id").nodeValue===u[1]?[t]:undefined:[]}};f.filter.ID=function(v,t){var u=typeof v.getAttributeNode!=="undefined"&&v.getAttributeNode("id");return v.nodeType===1&&u&&u.nodeValue===t}}e.removeChild(r);e=r=null})();(function(){var e=document.createElement("div");e.appendChild(document.createComment(""));if(e.getElementsByTagName("*").length>0){f.find.TAG=function(r,v){var u=v.getElementsByTagName(r[1]);if(r[1]==="*"){var t=[];for(var s=0;u[s];s++){if(u[s].nodeType===1){t.push(u[s])}}u=t}return u}}e.innerHTML="<a href='#'></a>";if(e.firstChild&&typeof e.firstChild.getAttribute!=="undefined"&&e.firstChild.getAttribute("href")!=="#"){f.attrHandle.href=function(r){return r.getAttribute("href",2)}}e=null})();if(document.querySelectorAll){(function(){var e=b,s=document.createElement("div");s.innerHTML="<p class='TEST'></p>";if(s.querySelectorAll&&s.querySelectorAll(".TEST").length===0){return}b=function(x,v,t,u){v=v||document;if(!u&&v.nodeType===9&&!b.isXML(v)){try{return a(v.querySelectorAll(x),t)}catch(y){}}return e(x,v,t,u)};for(var r in e){b[r]=e[r]}s=null})()}(function(){var e=document.createElement("div");e.innerHTML="<div class='test e'></div><div class='test'></div>";if(!e.getElementsByClassName||e.getElementsByClassName("e").length===0){return}e.lastChild.className="e";if(e.getElementsByClassName("e").length===1){return}f.order.splice(1,0,"CLASS");f.find.CLASS=function(r,s,t){if(typeof s.getElementsByClassName!=="undefined"&&!t){return s.getElementsByClassName(r[1])}};e=null})();function n(r,x,v,A,y,z){for(var t=0,s=A.length;t<s;t++){var e=A[t];if(e){e=e[r];var u=false;while(e){if(e.sizcache===v){u=A[e.sizset];break}if(e.nodeType===1&&!z){e.sizcache=v;e.sizset=t}if(e.nodeName.toLowerCase()===x){u=e;break}e=e[r]}A[t]=u}}}function q(r,x,v,A,y,z){for(var t=0,s=A.length;t<s;t++){var e=A[t];if(e){e=e[r];var u=false;while(e){if(e.sizcache===v){u=A[e.sizset];break}if(e.nodeType===1){if(!z){e.sizcache=v;e.sizset=t}if(typeof x!=="string"){if(e===x){u=true;break}}else{if(b.filter(x,[e]).length>0){u=e;break}}}e=e[r]}A[t]=u}}}b.contains=document.compareDocumentPosition?function(r,e){return !!(r.compareDocumentPosition(e)&16)}:function(r,e){return r!==e&&(r.contains?r.contains(e):true)};b.isXML=function(e){var r=(e?e.ownerDocument||e:0).documentElement;return r?r.nodeName!=="HTML":false};var h=function(e,y){var t=[],u="",v,s=y.nodeType?[y]:y;while((v=f.match.PSEUDO.exec(e))){u+=v[0];e=e.replace(f.match.PSEUDO,"")}e=f.relative[e]?e+"*":e;for(var x=0,r=s.length;x<r;x++){b(e,s[x],t)}return b.filter(u,t)};window.tinymce.dom.Sizzle=b})();(function(d){var f=d.each,c=d.DOM,b=d.isIE,e=d.isWebKit,a;d.create("tinymce.dom.EventUtils",{EventUtils:function(){this.inits=[];this.events=[]},add:function(m,p,l,j){var g,h=this,i=h.events,k;if(p instanceof Array){k=[];f(p,function(o){k.push(h.add(m,o,l,j))});return k}if(m&&m.hasOwnProperty&&m instanceof Array){k=[];f(m,function(n){n=c.get(n);k.push(h.add(n,p,l,j))});return k}m=c.get(m);if(!m){return}g=function(n){if(h.disabled){return}n=n||window.event;if(n&&b){if(!n.target){n.target=n.srcElement}d.extend(n,h._stoppers)}if(!j){return l(n)}return l.call(j,n)};if(p=="unload"){d.unloads.unshift({func:g});return g}if(p=="init"){if(h.domLoaded){g()}else{h.inits.push(g)}return g}i.push({obj:m,name:p,func:l,cfunc:g,scope:j});h._add(m,p,g);return l},remove:function(l,m,k){var h=this,g=h.events,i=false,j;if(l&&l.hasOwnProperty&&l instanceof Array){j=[];f(l,function(n){n=c.get(n);j.push(h.remove(n,m,k))});return j}l=c.get(l);f(g,function(o,n){if(o.obj==l&&o.name==m&&(!k||(o.func==k||o.cfunc==k))){g.splice(n,1);h._remove(l,m,o.cfunc);i=true;return false}});return i},clear:function(l){var j=this,g=j.events,h,k;if(l){l=c.get(l);for(h=g.length-1;h>=0;h--){k=g[h];if(k.obj===l){j._remove(k.obj,k.name,k.cfunc);k.obj=k.cfunc=null;g.splice(h,1)}}}},cancel:function(g){if(!g){return false}this.stop(g);return this.prevent(g)},stop:function(g){if(g.stopPropagation){g.stopPropagation()}else{g.cancelBubble=true}return false},prevent:function(g){if(g.preventDefault){g.preventDefault()}else{g.returnValue=false}return false},destroy:function(){var g=this;f(g.events,function(j,h){g._remove(j.obj,j.name,j.cfunc);j.obj=j.cfunc=null});g.events=[];g=null},_add:function(h,i,g){if(h.attachEvent){h.attachEvent("on"+i,g)}else{if(h.addEventListener){h.addEventListener(i,g,false)}else{h["on"+i]=g}}},_remove:function(i,j,h){if(i){try{if(i.detachEvent){i.detachEvent("on"+j,h)}else{if(i.removeEventListener){i.removeEventListener(j,h,false)}else{i["on"+j]=null}}}catch(g){}}},_pageInit:function(h){var g=this;if(g.domLoaded){return}g.domLoaded=true;f(g.inits,function(i){i()});g.inits=[]},_wait:function(i){var g=this,h=i.document;if(i.tinyMCE_GZ&&tinyMCE_GZ.loaded){g.domLoaded=1;return}if(h.attachEvent){h.attachEvent("onreadystatechange",function(){if(h.readyState==="complete"){h.detachEvent("onreadystatechange",arguments.callee);g._pageInit(i)}});if(h.documentElement.doScroll&&i==i.top){(function(){if(g.domLoaded){return}try{h.documentElement.doScroll("left")}catch(j){setTimeout(arguments.callee,0);return}g._pageInit(i)})()}}else{if(h.addEventListener){g._add(i,"DOMContentLoaded",function(){g._pageInit(i)})}}g._add(i,"load",function(){g._pageInit(i)})},_stoppers:{preventDefault:function(){this.returnValue=false},stopPropagation:function(){this.cancelBubble=true}}});a=d.dom.Event=new d.dom.EventUtils();a._wait(window);d.addUnload(function(){a.destroy()})})(tinymce);(function(a){a.dom.Element=function(f,d){var b=this,e,c;b.settings=d=d||{};b.id=f;b.dom=e=d.dom||a.DOM;if(!a.isIE){c=e.get(b.id)}a.each(("getPos,getRect,getParent,add,setStyle,getStyle,setStyles,setAttrib,setAttribs,getAttrib,addClass,removeClass,hasClass,getOuterHTML,setOuterHTML,remove,show,hide,isHidden,setHTML,get").split(/,/),function(g){b[g]=function(){var h=[f],j;for(j=0;j<arguments.length;j++){h.push(arguments[j])}h=e[g].apply(e,h);b.update(g);return h}});a.extend(b,{on:function(i,h,g){return a.dom.Event.add(b.id,i,h,g)},getXY:function(){return{x:parseInt(b.getStyle("left")),y:parseInt(b.getStyle("top"))}},getSize:function(){var g=e.get(b.id);return{w:parseInt(b.getStyle("width")||g.clientWidth),h:parseInt(b.getStyle("height")||g.clientHeight)}},moveTo:function(g,h){b.setStyles({left:g,top:h})},moveBy:function(g,i){var h=b.getXY();b.moveTo(h.x+g,h.y+i)},resizeTo:function(g,i){b.setStyles({width:g,height:i})},resizeBy:function(g,j){var i=b.getSize();b.resizeTo(i.w+g,i.h+j)},update:function(h){var g;if(a.isIE6&&d.blocker){h=h||"";if(h.indexOf("get")===0||h.indexOf("has")===0||h.indexOf("is")===0){return}if(h=="remove"){e.remove(b.blocker);return}if(!b.blocker){b.blocker=e.uniqueId();g=e.add(d.container||e.getRoot(),"iframe",{id:b.blocker,style:"position:absolute;",frameBorder:0,src:'javascript:""'});e.setStyle(g,"opacity",0)}else{g=e.get(b.blocker)}e.setStyles(g,{left:b.getStyle("left",1),top:b.getStyle("top",1),width:b.getStyle("width",1),height:b.getStyle("height",1),display:b.getStyle("display",1),zIndex:parseInt(b.getStyle("zIndex",1)||0)-1})}}})}})(tinymce);(function(c){function e(f){return f.replace(/[\n\r]+/g,"")}var b=c.is,a=c.isIE,d=c.each;c.create("tinymce.dom.Selection",{Selection:function(i,h,g){var f=this;f.dom=i;f.win=h;f.serializer=g;d(["onBeforeSetContent","onBeforeGetContent","onSetContent","onGetContent"],function(j){f[j]=new c.util.Dispatcher(f)});if(!f.win.getSelection){f.tridentSel=new c.dom.TridentSelection(f)}if(c.isIE&&i.boxModel){this._fixIESelection()}c.addUnload(f.destroy,f)},setCursorLocation:function(h,i){var f=this;var g=f.dom.createRng();g.setStart(h,i);g.setEnd(h,i);f.setRng(g);f.collapse(false)},getContent:function(g){var f=this,h=f.getRng(),l=f.dom.create("body"),j=f.getSel(),i,k,m;g=g||{};i=k="";g.get=true;g.format=g.format||"html";g.forced_root_block="";f.onBeforeGetContent.dispatch(f,g);if(g.format=="text"){return f.isCollapsed()?"":(h.text||(j.toString?j.toString():""))}if(h.cloneContents){m=h.cloneContents();if(m){l.appendChild(m)}}else{if(b(h.item)||b(h.htmlText)){l.innerHTML="<br>"+(h.item?h.item(0).outerHTML:h.htmlText);l.removeChild(l.firstChild)}else{l.innerHTML=h.toString()}}if(/^\s/.test(l.innerHTML)){i=" "}if(/\s+$/.test(l.innerHTML)){k=" "}g.getInner=true;g.content=f.isCollapsed()?"":i+f.serializer.serialize(l,g)+k;f.onGetContent.dispatch(f,g);return g.content},setContent:function(g,i){var n=this,f=n.getRng(),j,k=n.win.document,m,l;i=i||{format:"html"};i.set=true;g=i.content=g;if(!i.no_events){n.onBeforeSetContent.dispatch(n,i)}g=i.content;if(f.insertNode){g+='<span id="__caret">_</span>';if(f.startContainer==k&&f.endContainer==k){k.body.innerHTML=g}else{f.deleteContents();if(k.body.childNodes.length==0){k.body.innerHTML=g}else{if(f.createContextualFragment){f.insertNode(f.createContextualFragment(g))}else{m=k.createDocumentFragment();l=k.createElement("div");m.appendChild(l);l.outerHTML=g;f.insertNode(m)}}}j=n.dom.get("__caret");f=k.createRange();f.setStartBefore(j);f.setEndBefore(j);n.setRng(f);n.dom.remove("__caret");try{n.setRng(f)}catch(h){}}else{if(f.item){k.execCommand("Delete",false,null);f=n.getRng()}if(/^\s+/.test(g)){f.pasteHTML('<span id="__mce_tmp">_</span>'+g);n.dom.remove("__mce_tmp")}else{f.pasteHTML(g)}}if(!i.no_events){n.onSetContent.dispatch(n,i)}},getStart:function(){var g=this.getRng(),h,f,j,i;if(g.duplicate||g.item){if(g.item){return g.item(0)}j=g.duplicate();j.collapse(1);h=j.parentElement();f=i=g.parentElement();while(i=i.parentNode){if(i==h){h=f;break}}return h}else{h=g.startContainer;if(h.nodeType==1&&h.hasChildNodes()){h=h.childNodes[Math.min(h.childNodes.length-1,g.startOffset)]}if(h&&h.nodeType==3){return h.parentNode}return h}},getEnd:function(){var g=this,h=g.getRng(),i,f;if(h.duplicate||h.item){if(h.item){return h.item(0)}h=h.duplicate();h.collapse(0);i=h.parentElement();if(i&&i.nodeName=="BODY"){return i.lastChild||i}return i}else{i=h.endContainer;f=h.endOffset;if(i.nodeType==1&&i.hasChildNodes()){i=i.childNodes[f>0?f-1:f]}if(i&&i.nodeType==3){return i.parentNode}return i}},getBookmark:function(r,s){var v=this,m=v.dom,g,j,i,n,h,o,p,l="\uFEFF",u;function f(x,y){var t=0;d(m.select(x),function(A,z){if(A==y){t=z}});return t}if(r==2){function k(){var x=v.getRng(true),t=m.getRoot(),y={};function z(C,H){var B=C[H?"startContainer":"endContainer"],G=C[H?"startOffset":"endOffset"],A=[],D,F,E=0;if(B.nodeType==3){if(s){for(D=B.previousSibling;D&&D.nodeType==3;D=D.previousSibling){G+=D.nodeValue.length}}A.push(G)}else{F=B.childNodes;if(G>=F.length&&F.length){E=1;G=Math.max(0,F.length-1)}A.push(v.dom.nodeIndex(F[G],s)+E)}for(;B&&B!=t;B=B.parentNode){A.push(v.dom.nodeIndex(B,s))}return A}y.start=z(x,true);if(!v.isCollapsed()){y.end=z(x)}return y}if(v.tridentSel){return v.tridentSel.getBookmark(r)}return k()}if(r){return{rng:v.getRng()}}g=v.getRng();i=m.uniqueId();n=tinyMCE.activeEditor.selection.isCollapsed();u="overflow:hidden;line-height:0px";if(g.duplicate||g.item){if(!g.item){j=g.duplicate();try{g.collapse();g.pasteHTML('<span data-mce-type="bookmark" id="'+i+'_start" style="'+u+'">'+l+"</span>");if(!n){j.collapse(false);g.moveToElementText(j.parentElement());if(g.compareEndPoints("StartToEnd",j)==0){j.move("character",-1)}j.pasteHTML('<span data-mce-type="bookmark" id="'+i+'_end" style="'+u+'">'+l+"</span>")}}catch(q){return null}}else{o=g.item(0);h=o.nodeName;return{name:h,index:f(h,o)}}}else{o=v.getNode();h=o.nodeName;if(h=="IMG"){return{name:h,index:f(h,o)}}j=g.cloneRange();if(!n){j.collapse(false);j.insertNode(m.create("span",{"data-mce-type":"bookmark",id:i+"_end",style:u},l))}g.collapse(true);g.insertNode(m.create("span",{"data-mce-type":"bookmark",id:i+"_start",style:u},l))}v.moveToBookmark({id:i,keep:1});return{id:i}},moveToBookmark:function(n){var r=this,l=r.dom,i,h,f,q,j,s,o,p;if(n){if(n.start){f=l.createRng();q=l.getRoot();function g(z){var t=n[z?"start":"end"],v,x,y,u;if(t){y=t[0];for(x=q,v=t.length-1;v>=1;v--){u=x.childNodes;if(t[v]>u.length-1){return}x=u[t[v]]}if(x.nodeType===3){y=Math.min(t[0],x.nodeValue.length)}if(x.nodeType===1){y=Math.min(t[0],x.childNodes.length)}if(z){f.setStart(x,y)}else{f.setEnd(x,y)}}return true}if(r.tridentSel){return r.tridentSel.moveToBookmark(n)}if(g(true)&&g()){r.setRng(f)}}else{if(n.id){function k(A){var u=l.get(n.id+"_"+A),z,t,x,y,v=n.keep;if(u){z=u.parentNode;if(A=="start"){if(!v){t=l.nodeIndex(u)}else{z=u.firstChild;t=1}j=s=z;o=p=t}else{if(!v){t=l.nodeIndex(u)}else{z=u.firstChild;t=1}s=z;p=t}if(!v){y=u.previousSibling;x=u.nextSibling;d(c.grep(u.childNodes),function(B){if(B.nodeType==3){B.nodeValue=B.nodeValue.replace(/\uFEFF/g,"")}});while(u=l.get(n.id+"_"+A)){l.remove(u,1)}if(y&&x&&y.nodeType==x.nodeType&&y.nodeType==3&&!c.isOpera){t=y.nodeValue.length;y.appendData(x.nodeValue);l.remove(x);if(A=="start"){j=s=y;o=p=t}else{s=y;p=t}}}}}function m(t){if(l.isBlock(t)&&!t.innerHTML){t.innerHTML=!a?'<br data-mce-bogus="1" />':" "}return t}k("start");k("end");if(j){f=l.createRng();f.setStart(m(j),o);f.setEnd(m(s),p);r.setRng(f)}}else{if(n.name){r.select(l.select(n.name)[n.index])}else{if(n.rng){r.setRng(n.rng)}}}}}},select:function(k,j){var i=this,l=i.dom,g=l.createRng(),f;if(k){f=l.nodeIndex(k);g.setStart(k.parentNode,f);g.setEnd(k.parentNode,f+1);if(j){function h(m,o){var n=new c.dom.TreeWalker(m,m);do{if(m.nodeType==3&&c.trim(m.nodeValue).length!=0){if(o){g.setStart(m,0)}else{g.setEnd(m,m.nodeValue.length)}return}if(m.nodeName=="BR"){if(o){g.setStartBefore(m)}else{g.setEndBefore(m)}return}}while(m=(o?n.next():n.prev()))}h(k,1);h(k)}i.setRng(g)}return k},isCollapsed:function(){var f=this,h=f.getRng(),g=f.getSel();if(!h||h.item){return false}if(h.compareEndPoints){return h.compareEndPoints("StartToEnd",h)===0}return !g||h.collapsed},collapse:function(f){var h=this,g=h.getRng(),i;if(g.item){i=g.item(0);g=h.win.document.body.createTextRange();g.moveToElementText(i)}g.collapse(!!f);h.setRng(g)},getSel:function(){var g=this,f=this.win;return f.getSelection?f.getSelection():f.document.selection},getRng:function(l){var g=this,h,i,k,j=g.win.document;if(l&&g.tridentSel){return g.tridentSel.getRangeAt(0)}try{if(h=g.getSel()){i=h.rangeCount>0?h.getRangeAt(0):(h.createRange?h.createRange():j.createRange())}}catch(f){}if(c.isIE&&i&&i.setStart&&j.selection.createRange().item){k=j.selection.createRange().item(0);i=j.createRange();i.setStartBefore(k);i.setEndAfter(k)}if(!i){i=j.createRange?j.createRange():j.body.createTextRange()}if(g.selectedRange&&g.explicitRange){if(i.compareBoundaryPoints(i.START_TO_START,g.selectedRange)===0&&i.compareBoundaryPoints(i.END_TO_END,g.selectedRange)===0){i=g.explicitRange}else{g.selectedRange=null;g.explicitRange=null}}return i},setRng:function(i){var h,g=this;if(!g.tridentSel){h=g.getSel();if(h){g.explicitRange=i;try{h.removeAllRanges()}catch(f){}h.addRange(i);g.selectedRange=h.getRangeAt(0)}}else{if(i.cloneRange){g.tridentSel.addRange(i);return}try{i.select()}catch(f){}}},setNode:function(g){var f=this;f.setContent(f.dom.getOuterHTML(g));return g},getNode:function(){var h=this,g=h.getRng(),i=h.getSel(),l,k=g.startContainer,f=g.endContainer;if(!g){return h.dom.getRoot()}if(g.setStart){l=g.commonAncestorContainer;if(!g.collapsed){if(g.startContainer==g.endContainer){if(g.endOffset-g.startOffset<2){if(g.startContainer.hasChildNodes()){l=g.startContainer.childNodes[g.startOffset]}}}if(k.nodeType===3&&f.nodeType===3){function j(p,m){var o=p;while(p&&p.nodeType===3&&p.length===0){p=m?p.nextSibling:p.previousSibling}return p||o}if(k.length===g.startOffset){k=j(k.nextSibling,true)}else{k=k.parentNode}if(g.endOffset===0){f=j(f.previousSibling,false)}else{f=f.parentNode}if(k&&k===f){return k}}}if(l&&l.nodeType==3){return l.parentNode}return l}return g.item?g.item(0):g.parentElement()},getSelectedBlocks:function(o,g){var m=this,j=m.dom,l,k,h,i=[];l=j.getParent(o||m.getStart(),j.isBlock);k=j.getParent(g||m.getEnd(),j.isBlock);if(l){i.push(l)}if(l&&k&&l!=k){h=l;var f=new c.dom.TreeWalker(l,j.getRoot());while((h=f.next())&&h!=k){if(j.isBlock(h)){i.push(h)}}}if(k&&l!=k){i.push(k)}return i},normalize:function(){var g=this,f,i;if(c.isIE){return}function h(p){var k,o,n,m=g.dom,j=m.getRoot(),l;k=f[(p?"start":"end")+"Container"];o=f[(p?"start":"end")+"Offset"];if(k.nodeType===9){k=k.body;o=0}if(k===j){if(k.hasChildNodes()){k=k.childNodes[Math.min(!p&&o>0?o-1:o,k.childNodes.length-1)];o=0;if(k.hasChildNodes()){l=k;n=new c.dom.TreeWalker(k,j);do{if(l.nodeType===3){o=p?0:l.nodeValue.length-1;k=l;break}if(l.nodeName==="BR"){o=m.nodeIndex(l);k=l.parentNode;break}}while(l=(p?n.next():n.prev()));i=true}}}if(i){f["set"+(p?"Start":"End")](k,o)}}f=g.getRng();h(true);if(f.collapsed){h()}if(i){g.setRng(f)}},destroy:function(g){var f=this;f.win=null;if(!g){c.removeUnload(f.destroy)}},_fixIESelection:function(){var g=this.dom,m=g.doc,h=m.body,j,n,f;m.documentElement.unselectable=true;function i(o,r){var p=h.createTextRange();try{p.moveToPoint(o,r)}catch(q){p=null}return p}function l(p){var o;if(p.button){o=i(p.x,p.y);if(o){if(o.compareEndPoints("StartToStart",n)>0){o.setEndPoint("StartToStart",n)}else{o.setEndPoint("EndToEnd",n)}o.select()}}else{k()}}function k(){var o=m.selection.createRange();if(n&&!o.item&&o.compareEndPoints("StartToEnd",o)===0){n.select()}g.unbind(m,"mouseup",k);g.unbind(m,"mousemove",l);n=j=0}g.bind(m,["mousedown","contextmenu"],function(o){if(o.target.nodeName==="HTML"){if(j){k()}f=m.documentElement;if(f.scrollHeight>f.clientHeight){return}j=1;n=i(o.x,o.y);if(n){g.bind(m,"mouseup",k);g.bind(m,"mousemove",l);g.win.focus();n.select()}}})}})})(tinymce);(function(a){a.dom.Serializer=function(e,i,f){var h,b,d=a.isIE,g=a.each,c;if(!e.apply_source_formatting){e.indent=false}e.remove_trailing_brs=true;i=i||a.DOM;f=f||new a.html.Schema(e);e.entity_encoding=e.entity_encoding||"named";h=new a.util.Dispatcher(self);b=new a.util.Dispatcher(self);c=new a.html.DomParser(e,f);c.addAttributeFilter("src,href,style",function(k,j){var o=k.length,l,q,n="data-mce-"+j,p=e.url_converter,r=e.url_converter_scope,m;while(o--){l=k[o];q=l.attributes.map[n];if(q!==m){l.attr(j,q.length>0?q:null);l.attr(n,null)}else{q=l.attributes.map[j];if(j==="style"){q=i.serializeStyle(i.parseStyle(q),l.name)}else{if(p){q=p.call(r,q,j,l.name)}}l.attr(j,q.length>0?q:null)}}});c.addAttributeFilter("class",function(j,k){var l=j.length,m,n;while(l--){m=j[l];n=m.attr("class").replace(/\s*mce(Item\w+|Selected)\s*/g,"");m.attr("class",n.length>0?n:null)}});c.addAttributeFilter("data-mce-type",function(j,l,k){var m=j.length,n;while(m--){n=j[m];if(n.attributes.map["data-mce-type"]==="bookmark"&&!k.cleanup){n.remove()}}});c.addNodeFilter("script,style",function(k,l){var m=k.length,n,o;function j(p){return p.replace(/(<!--\[CDATA\[|\]\]-->)/g,"\n").replace(/^[\r\n]*|[\r\n]*$/g,"").replace(/^\s*(\/\/\s*<!--|\/\/\s*<!\[CDATA\[|<!--|<!\[CDATA\[)[\r\n]*/g,"").replace(/\s*(\/\/\s*\]\]>|\/\/\s*-->|\]\]>|-->|\]\]-->)\s*$/g,"")}while(m--){n=k[m];o=n.firstChild?n.firstChild.value:"";if(l==="script"){n.attr("type",(n.attr("type")||"text/javascript").replace(/^mce\-/,""));if(o.length>0){n.firstChild.value="// <![CDATA[\n"+j(o)+"\n// ]]>"}}else{if(o.length>0){n.firstChild.value="<!--\n"+j(o)+"\n-->"}}}});c.addNodeFilter("#comment",function(j,k){var l=j.length,m;while(l--){m=j[l];if(m.value.indexOf("[CDATA[")===0){m.name="#cdata";m.type=4;m.value=m.value.replace(/^\[CDATA\[|\]\]$/g,"")}else{if(m.value.indexOf("mce:protected ")===0){m.name="#text";m.type=3;m.raw=true;m.value=unescape(m.value).substr(14)}}}});c.addNodeFilter("xml:namespace,input",function(j,k){var l=j.length,m;while(l--){m=j[l];if(m.type===7){m.remove()}else{if(m.type===1){if(k==="input"&&!("type" in m.attributes.map)){m.attr("type","text")}}}}});if(e.fix_list_elements){c.addNodeFilter("ul,ol",function(k,l){var m=k.length,n,j;while(m--){n=k[m];j=n.parent;if(j.name==="ul"||j.name==="ol"){if(n.prev&&n.prev.name==="li"){n.prev.append(n)}}}})}c.addAttributeFilter("data-mce-src,data-mce-href,data-mce-style",function(j,k){var l=j.length;while(l--){j[l].attr(k,null)}});return{schema:f,addNodeFilter:c.addNodeFilter,addAttributeFilter:c.addAttributeFilter,onPreProcess:h,onPostProcess:b,serialize:function(o,m){var l,p,k,j,n;if(d&&i.select("script,style,select,map").length>0){n=o.innerHTML;o=o.cloneNode(false);i.setHTML(o,n)}else{o=o.cloneNode(true)}l=o.ownerDocument.implementation;if(l.createHTMLDocument){p=l.createHTMLDocument("");g(o.nodeName=="BODY"?o.childNodes:[o],function(q){p.body.appendChild(p.importNode(q,true))});if(o.nodeName!="BODY"){o=p.body.firstChild}else{o=p.body}k=i.doc;i.doc=p}m=m||{};m.format=m.format||"html";if(!m.no_events){m.node=o;h.dispatch(self,m)}j=new a.html.Serializer(e,f);m.content=j.serialize(c.parse(m.getInner?o.innerHTML:a.trim(i.getOuterHTML(o),m),m));if(!m.cleanup){m.content=m.content.replace(/\uFEFF|\u200B/g,"")}if(!m.no_events){b.dispatch(self,m)}if(k){i.doc=k}m.node=null;return m.content},addRules:function(j){f.addValidElements(j)},setRules:function(j){f.setValidElements(j)}}}})(tinymce);(function(a){a.dom.ScriptLoader=function(h){var c=0,k=1,i=2,l={},j=[],f={},d=[],g=0,e;function b(m,v){var x=this,q=a.DOM,s,o,r,n;function p(){q.remove(n);if(s){s.onreadystatechange=s.onload=s=null}v()}function u(){if(typeof(console)!=="undefined"&&console.log){console.log("Failed to load: "+m)}}n=q.uniqueId();if(a.isIE6){o=new a.util.URI(m);r=location;if(o.host==r.hostname&&o.port==r.port&&(o.protocol+":")==r.protocol&&o.protocol.toLowerCase()!="file"){a.util.XHR.send({url:a._addVer(o.getURI()),success:function(y){var t=q.create("script",{type:"text/javascript"});t.text=y;document.getElementsByTagName("head")[0].appendChild(t);q.remove(t);p()},error:u});return}}s=q.create("script",{id:n,type:"text/javascript",src:a._addVer(m)});if(!a.isIE){s.onload=p}s.onerror=u;if(!a.isOpera){s.onreadystatechange=function(){var t=s.readyState;if(t=="complete"||t=="loaded"){p()}}}(document.getElementsByTagName("head")[0]||document.body).appendChild(s)}this.isDone=function(m){return l[m]==i};this.markDone=function(m){l[m]=i};this.add=this.load=function(m,q,n){var o,p=l[m];if(p==e){j.push(m);l[m]=c}if(q){if(!f[m]){f[m]=[]}f[m].push({func:q,scope:n||this})}};this.loadQueue=function(n,m){this.loadScripts(j,n,m)};this.loadScripts=function(m,q,p){var o;function n(r){a.each(f[r],function(s){s.func.call(s.scope)});f[r]=e}d.push({func:q,scope:p||this});o=function(){var r=a.grep(m);m.length=0;a.each(r,function(s){if(l[s]==i){n(s);return}if(l[s]!=k){l[s]=k;g++;b(s,function(){l[s]=i;g--;n(s);o()})}});if(!g){a.each(d,function(s){s.func.call(s.scope)});d.length=0}};o()}};a.ScriptLoader=new a.dom.ScriptLoader()})(tinymce);tinymce.dom.TreeWalker=function(a,c){var b=a;function d(i,f,e,j){var h,g;if(i){if(!j&&i[f]){return i[f]}if(i!=c){h=i[e];if(h){return h}for(g=i.parentNode;g&&g!=c;g=g.parentNode){h=g[e];if(h){return h}}}}}this.current=function(){return b};this.next=function(e){return(b=d(b,"firstChild","nextSibling",e))};this.prev=function(e){return(b=d(b,"lastChild","previousSibling",e))}};(function(a){a.dom.RangeUtils=function(c){var b="\uFEFF";this.walk=function(d,s){var i=d.startContainer,l=d.startOffset,t=d.endContainer,m=d.endOffset,j,g,o,h,r,q,e;e=c.select("td.mceSelected,th.mceSelected");if(e.length>0){a.each(e,function(u){s([u])});return}function f(u){var v;v=u[0];if(v.nodeType===3&&v===i&&l>=v.nodeValue.length){u.splice(0,1)}v=u[u.length-1];if(m===0&&u.length>0&&v===t&&v.nodeType===3){u.splice(u.length-1,1)}return u}function p(x,v,u){var y=[];for(;x&&x!=u;x=x[v]){y.push(x)}return y}function n(v,u){do{if(v.parentNode==u){return v}v=v.parentNode}while(v)}function k(x,v,y){var u=y?"nextSibling":"previousSibling";for(h=x,r=h.parentNode;h&&h!=v;h=r){r=h.parentNode;q=p(h==x?h:h[u],u);if(q.length){if(!y){q.reverse()}s(f(q))}}}if(i.nodeType==1&&i.hasChildNodes()){i=i.childNodes[l]}if(t.nodeType==1&&t.hasChildNodes()){t=t.childNodes[Math.min(m-1,t.childNodes.length-1)]}if(i==t){return s(f([i]))}j=c.findCommonAncestor(i,t);for(h=i;h;h=h.parentNode){if(h===t){return k(i,j,true)}if(h===j){break}}for(h=t;h;h=h.parentNode){if(h===i){return k(t,j)}if(h===j){break}}g=n(i,j)||i;o=n(t,j)||t;k(i,g,true);q=p(g==i?g:g.nextSibling,"nextSibling",o==t?o.nextSibling:o);if(q.length){s(f(q))}k(t,o)};this.split=function(e){var h=e.startContainer,d=e.startOffset,i=e.endContainer,g=e.endOffset;function f(j,k){return j.splitText(k)}if(h==i&&h.nodeType==3){if(d>0&&d<h.nodeValue.length){i=f(h,d);h=i.previousSibling;if(g>d){g=g-d;h=i=f(i,g).previousSibling;g=i.nodeValue.length;d=0}else{g=0}}}else{if(h.nodeType==3&&d>0&&d<h.nodeValue.length){h=f(h,d);d=0}if(i.nodeType==3&&g>0&&g<i.nodeValue.length){i=f(i,g).previousSibling;g=i.nodeValue.length}}return{startContainer:h,startOffset:d,endContainer:i,endOffset:g}}};a.dom.RangeUtils.compareRanges=function(c,b){if(c&&b){if(c.item||c.duplicate){if(c.item&&b.item&&c.item(0)===b.item(0)){return true}if(c.isEqual&&b.isEqual&&b.isEqual(c)){return true}}else{return c.startContainer==b.startContainer&&c.startOffset==b.startOffset}}return false}})(tinymce);(function(b){var a=b.dom.Event,c=b.each;b.create("tinymce.ui.KeyboardNavigation",{KeyboardNavigation:function(e,f){var p=this,m=e.root,l=e.items,n=e.enableUpDown,i=e.enableLeftRight||!e.enableUpDown,k=e.excludeFromTabOrder,j,h,o,d,g;f=f||b.DOM;j=function(q){g=q.target.id};h=function(q){f.setAttrib(q.target.id,"tabindex","-1")};d=function(q){var r=f.get(g);f.setAttrib(r,"tabindex","0");r.focus()};p.focus=function(){f.get(g).focus()};p.destroy=function(){c(l,function(q){f.unbind(f.get(q.id),"focus",j);f.unbind(f.get(q.id),"blur",h)});f.unbind(f.get(m),"focus",d);f.unbind(f.get(m),"keydown",o);l=f=m=p.focus=j=h=o=d=null;p.destroy=function(){}};p.moveFocus=function(u,r){var q=-1,t=p.controls,s;if(!g){return}c(l,function(x,v){if(x.id===g){q=v;return false}});q+=u;if(q<0){q=l.length-1}else{if(q>=l.length){q=0}}s=l[q];f.setAttrib(g,"tabindex","-1");f.setAttrib(s.id,"tabindex","0");f.get(s.id).focus();if(e.actOnFocus){e.onAction(s.id)}if(r){a.cancel(r)}};o=function(y){var u=37,t=39,x=38,z=40,q=27,s=14,r=13,v=32;switch(y.keyCode){case u:if(i){p.moveFocus(-1)}break;case t:if(i){p.moveFocus(1)}break;case x:if(n){p.moveFocus(-1)}break;case z:if(n){p.moveFocus(1)}break;case q:if(e.onCancel){e.onCancel();a.cancel(y)}break;case s:case r:case v:if(e.onAction){e.onAction(g);a.cancel(y)}break}};c(l,function(s,q){var r;if(!s.id){s.id=f.uniqueId("_mce_item_")}if(k){f.bind(s.id,"blur",h);r="-1"}else{r=(q===0?"0":"-1")}f.setAttrib(s.id,"tabindex",r);f.bind(f.get(s.id),"focus",j)});if(l[0]){g=l[0].id}f.setAttrib(m,"tabindex","-1");f.bind(f.get(m),"focus",d);f.bind(f.get(m),"keydown",o)}})})(tinymce);(function(c){var b=c.DOM,a=c.is;c.create("tinymce.ui.Control",{Control:function(f,e,d){this.id=f;this.settings=e=e||{};this.rendered=false;this.onRender=new c.util.Dispatcher(this);this.classPrefix="";this.scope=e.scope||this;this.disabled=0;this.active=0;this.editor=d},setAriaProperty:function(f,e){var d=b.get(this.id+"_aria")||b.get(this.id);if(d){b.setAttrib(d,"aria-"+f,!!e)}},focus:function(){b.get(this.id).focus()},setDisabled:function(d){if(d!=this.disabled){this.setAriaProperty("disabled",d);this.setState("Disabled",d);this.setState("Enabled",!d);this.disabled=d}},isDisabled:function(){return this.disabled},setActive:function(d){if(d!=this.active){this.setState("Active",d);this.active=d;this.setAriaProperty("pressed",d)}},isActive:function(){return this.active},setState:function(f,d){var e=b.get(this.id);f=this.classPrefix+f;if(d){b.addClass(e,f)}else{b.removeClass(e,f)}},isRendered:function(){return this.rendered},renderHTML:function(){},renderTo:function(d){b.setHTML(d,this.renderHTML())},postRender:function(){var e=this,d;if(a(e.disabled)){d=e.disabled;e.disabled=-1;e.setDisabled(d)}if(a(e.active)){d=e.active;e.active=-1;e.setActive(d)}},remove:function(){b.remove(this.id);this.destroy()},destroy:function(){c.dom.Event.clear(this.id)}})})(tinymce);tinymce.create("tinymce.ui.Container:tinymce.ui.Control",{Container:function(c,b,a){this.parent(c,b,a);this.controls=[];this.lookup={}},add:function(a){this.lookup[a.id]=a;this.controls.push(a);return a},get:function(a){return this.lookup[a]}});tinymce.create("tinymce.ui.Separator:tinymce.ui.Control",{Separator:function(b,a){this.parent(b,a);this.classPrefix="mceSeparator";this.setDisabled(true)},renderHTML:function(){return tinymce.DOM.createHTML("span",{"class":this.classPrefix,role:"separator","aria-orientation":"vertical",tabindex:"-1"})}});(function(d){var c=d.is,b=d.DOM,e=d.each,a=d.walk;d.create("tinymce.ui.MenuItem:tinymce.ui.Control",{MenuItem:function(g,f){this.parent(g,f);this.classPrefix="mceMenuItem"},setSelected:function(f){this.setState("Selected",f);this.setAriaProperty("checked",!!f);this.selected=f},isSelected:function(){return this.selected},postRender:function(){var f=this;f.parent();if(c(f.selected)){f.setSelected(f.selected)}}})})(tinymce);(function(d){var c=d.is,b=d.DOM,e=d.each,a=d.walk;d.create("tinymce.ui.Menu:tinymce.ui.MenuItem",{Menu:function(h,g){var f=this;f.parent(h,g);f.items={};f.collapsed=false;f.menuCount=0;f.onAddItem=new d.util.Dispatcher(this)},expand:function(g){var f=this;if(g){a(f,function(h){if(h.expand){h.expand()}},"items",f)}f.collapsed=false},collapse:function(g){var f=this;if(g){a(f,function(h){if(h.collapse){h.collapse()}},"items",f)}f.collapsed=true},isCollapsed:function(){return this.collapsed},add:function(f){if(!f.settings){f=new d.ui.MenuItem(f.id||b.uniqueId(),f)}this.onAddItem.dispatch(this,f);return this.items[f.id]=f},addSeparator:function(){return this.add({separator:true})},addMenu:function(f){if(!f.collapse){f=this.createMenu(f)}this.menuCount++;return this.add(f)},hasMenus:function(){return this.menuCount!==0},remove:function(f){delete this.items[f.id]},removeAll:function(){var f=this;a(f,function(g){if(g.removeAll){g.removeAll()}else{g.remove()}g.destroy()},"items",f);f.items={}},createMenu:function(g){var f=new d.ui.Menu(g.id||b.uniqueId(),g);f.onAddItem.add(this.onAddItem.dispatch,this.onAddItem);return f}})})(tinymce);(function(e){var d=e.is,c=e.DOM,f=e.each,a=e.dom.Event,b=e.dom.Element;e.create("tinymce.ui.DropMenu:tinymce.ui.Menu",{DropMenu:function(h,g){g=g||{};g.container=g.container||c.doc.body;g.offset_x=g.offset_x||0;g.offset_y=g.offset_y||0;g.vp_offset_x=g.vp_offset_x||0;g.vp_offset_y=g.vp_offset_y||0;if(d(g.icons)&&!g.icons){g["class"]+=" mceNoIcons"}this.parent(h,g);this.onShowMenu=new e.util.Dispatcher(this);this.onHideMenu=new e.util.Dispatcher(this);this.classPrefix="mceMenu"},createMenu:function(j){var h=this,i=h.settings,g;j.container=j.container||i.container;j.parent=h;j.constrain=j.constrain||i.constrain;j["class"]=j["class"]||i["class"];j.vp_offset_x=j.vp_offset_x||i.vp_offset_x;j.vp_offset_y=j.vp_offset_y||i.vp_offset_y;j.keyboard_focus=i.keyboard_focus;g=new e.ui.DropMenu(j.id||c.uniqueId(),j);g.onAddItem.add(h.onAddItem.dispatch,h.onAddItem);return g},focus:function(){var g=this;if(g.keyboardNav){g.keyboardNav.focus()}},update:function(){var i=this,j=i.settings,g=c.get("menu_"+i.id+"_tbl"),l=c.get("menu_"+i.id+"_co"),h,k;h=j.max_width?Math.min(g.clientWidth,j.max_width):g.clientWidth;k=j.max_height?Math.min(g.clientHeight,j.max_height):g.clientHeight;if(!c.boxModel){i.element.setStyles({width:h+2,height:k+2})}else{i.element.setStyles({width:h,height:k})}if(j.max_width){c.setStyle(l,"width",h)}if(j.max_height){c.setStyle(l,"height",k);if(g.clientHeight<j.max_height){c.setStyle(l,"overflow","hidden")}}},showMenu:function(p,n,r){var z=this,A=z.settings,o,g=c.getViewPort(),u,l,v,q,i=2,k,j,m=z.classPrefix;z.collapse(1);if(z.isMenuVisible){return}if(!z.rendered){o=c.add(z.settings.container,z.renderNode());f(z.items,function(h){h.postRender()});z.element=new b("menu_"+z.id,{blocker:1,container:A.container})}else{o=c.get("menu_"+z.id)}if(!e.isOpera){c.setStyles(o,{left:-65535,top:-65535})}c.show(o);z.update();p+=A.offset_x||0;n+=A.offset_y||0;g.w-=4;g.h-=4;if(A.constrain){u=o.clientWidth-i;l=o.clientHeight-i;v=g.x+g.w;q=g.y+g.h;if((p+A.vp_offset_x+u)>v){p=r?r-u:Math.max(0,(v-A.vp_offset_x)-u)}if((n+A.vp_offset_y+l)>q){n=Math.max(0,(q-A.vp_offset_y)-l)}}c.setStyles(o,{left:p,top:n});z.element.update();z.isMenuVisible=1;z.mouseClickFunc=a.add(o,"click",function(s){var h;s=s.target;if(s&&(s=c.getParent(s,"tr"))&&!c.hasClass(s,m+"ItemSub")){h=z.items[s.id];if(h.isDisabled()){return}k=z;while(k){if(k.hideMenu){k.hideMenu()}k=k.settings.parent}if(h.settings.onclick){h.settings.onclick(s)}return a.cancel(s)}});if(z.hasMenus()){z.mouseOverFunc=a.add(o,"mouseover",function(x){var h,t,s;x=x.target;if(x&&(x=c.getParent(x,"tr"))){h=z.items[x.id];if(z.lastMenu){z.lastMenu.collapse(1)}if(h.isDisabled()){return}if(x&&c.hasClass(x,m+"ItemSub")){t=c.getRect(x);h.showMenu((t.x+t.w-i),t.y-i,t.x);z.lastMenu=h;c.addClass(c.get(h.id).firstChild,m+"ItemActive")}}})}a.add(o,"keydown",z._keyHandler,z);z.onShowMenu.dispatch(z);if(A.keyboard_focus){z._setupKeyboardNav()}},hideMenu:function(j){var g=this,i=c.get("menu_"+g.id),h;if(!g.isMenuVisible){return}if(g.keyboardNav){g.keyboardNav.destroy()}a.remove(i,"mouseover",g.mouseOverFunc);a.remove(i,"click",g.mouseClickFunc);a.remove(i,"keydown",g._keyHandler);c.hide(i);g.isMenuVisible=0;if(!j){g.collapse(1)}if(g.element){g.element.hide()}if(h=c.get(g.id)){c.removeClass(h.firstChild,g.classPrefix+"ItemActive")}g.onHideMenu.dispatch(g)},add:function(i){var g=this,h;i=g.parent(i);if(g.isRendered&&(h=c.get("menu_"+g.id))){g._add(c.select("tbody",h)[0],i)}return i},collapse:function(g){this.parent(g);this.hideMenu(1)},remove:function(g){c.remove(g.id);this.destroy();return this.parent(g)},destroy:function(){var g=this,h=c.get("menu_"+g.id);if(g.keyboardNav){g.keyboardNav.destroy()}a.remove(h,"mouseover",g.mouseOverFunc);a.remove(c.select("a",h),"focus",g.mouseOverFunc);a.remove(h,"click",g.mouseClickFunc);a.remove(h,"keydown",g._keyHandler);if(g.element){g.element.remove()}c.remove(h)},renderNode:function(){var i=this,j=i.settings,l,h,k,g;g=c.create("div",{role:"listbox",id:"menu_"+i.id,"class":j["class"],style:"position:absolute;left:0;top:0;z-index:200000;outline:0"});if(i.settings.parent){c.setAttrib(g,"aria-parent","menu_"+i.settings.parent.id)}k=c.add(g,"div",{role:"presentation",id:"menu_"+i.id+"_co","class":i.classPrefix+(j["class"]?" "+j["class"]:"")});i.element=new b("menu_"+i.id,{blocker:1,container:j.container});if(j.menu_line){c.add(k,"span",{"class":i.classPrefix+"Line"})}l=c.add(k,"table",{role:"presentation",id:"menu_"+i.id+"_tbl",border:0,cellPadding:0,cellSpacing:0});h=c.add(l,"tbody");f(i.items,function(m){i._add(h,m)});i.rendered=true;return g},_setupKeyboardNav:function(){var i,h,g=this;i=c.select("#menu_"+g.id)[0];h=c.select("a[role=option]","menu_"+g.id);h.splice(0,0,i);g.keyboardNav=new e.ui.KeyboardNavigation({root:"menu_"+g.id,items:h,onCancel:function(){g.hideMenu()},enableUpDown:true});i.focus()},_keyHandler:function(g){var h=this,i;switch(g.keyCode){case 37:if(h.settings.parent){h.hideMenu();h.settings.parent.focus();a.cancel(g)}break;case 39:if(h.mouseOverFunc){h.mouseOverFunc(g)}break}},_add:function(j,h){var i,q=h.settings,p,l,k,m=this.classPrefix,g;if(q.separator){l=c.add(j,"tr",{id:h.id,"class":m+"ItemSeparator"});c.add(l,"td",{"class":m+"ItemSeparator"});if(i=l.previousSibling){c.addClass(i,"mceLast")}return}i=l=c.add(j,"tr",{id:h.id,"class":m+"Item "+m+"ItemEnabled"});i=k=c.add(i,q.titleItem?"th":"td");i=p=c.add(i,"a",{id:h.id+"_aria",role:q.titleItem?"presentation":"option",href:"javascript:;",onclick:"return false;",onmousedown:"return false;"});if(q.parent){c.setAttrib(p,"aria-haspopup","true");c.setAttrib(p,"aria-owns","menu_"+h.id)}c.addClass(k,q["class"]);g=c.add(i,"span",{"class":"mceIcon"+(q.icon?" mce_"+q.icon:"")});if(q.icon_src){c.add(g,"img",{src:q.icon_src})}i=c.add(i,q.element||"span",{"class":"mceText",title:h.settings.title},h.settings.title);if(h.settings.style){c.setAttrib(i,"style",h.settings.style)}if(j.childNodes.length==1){c.addClass(l,"mceFirst")}if((i=l.previousSibling)&&c.hasClass(i,m+"ItemSeparator")){c.addClass(l,"mceFirst")}if(h.collapse){c.addClass(l,m+"ItemSub")}if(i=l.previousSibling){c.removeClass(i,"mceLast")}c.addClass(l,"mceLast")}})})(tinymce);(function(b){var a=b.DOM;b.create("tinymce.ui.Button:tinymce.ui.Control",{Button:function(e,d,c){this.parent(e,d,c);this.classPrefix="mceButton"},renderHTML:function(){var f=this.classPrefix,e=this.settings,d,c;c=a.encode(e.label||"");d='<a role="button" id="'+this.id+'" href="javascript:;" class="'+f+" "+f+"Enabled "+e["class"]+(c?" "+f+"Labeled":"")+'" onmousedown="return false;" onclick="return false;" aria-labelledby="'+this.id+'_voice" title="'+a.encode(e.title)+'">';if(e.image&&!(this.editor&&this.editor.forcedHighContrastMode)){d+='<img class="mceIcon" src="'+e.image+'" alt="'+a.encode(e.title)+'" />'+c}else{d+='<span class="mceIcon '+e["class"]+'"></span>'+(c?'<span class="'+f+'Label">'+c+"</span>":"")}d+='<span class="mceVoiceLabel mceIconOnly" style="display: none;" id="'+this.id+'_voice">'+e.title+"</span>";d+="</a>";return d},postRender:function(){var c=this,d=c.settings;b.dom.Event.add(c.id,"click",function(f){if(!c.isDisabled()){return d.onclick.call(d.scope,f)}})}})})(tinymce);(function(d){var c=d.DOM,b=d.dom.Event,e=d.each,a=d.util.Dispatcher;d.create("tinymce.ui.ListBox:tinymce.ui.Control",{ListBox:function(i,h,f){var g=this;g.parent(i,h,f);g.items=[];g.onChange=new a(g);g.onPostRender=new a(g);g.onAdd=new a(g);g.onRenderMenu=new d.util.Dispatcher(this);g.classPrefix="mceListBox"},select:function(h){var g=this,j,i;if(h==undefined){return g.selectByIndex(-1)}if(h&&h.call){i=h}else{i=function(f){return f==h}}if(h!=g.selectedValue){e(g.items,function(k,f){if(i(k.value)){j=1;g.selectByIndex(f);return false}});if(!j){g.selectByIndex(-1)}}},selectByIndex:function(f){var h=this,i,j,g;if(f!=h.selectedIndex){i=c.get(h.id+"_text");g=c.get(h.id+"_voiceDesc");j=h.items[f];if(j){h.selectedValue=j.value;h.selectedIndex=f;c.setHTML(i,c.encode(j.title));c.setHTML(g,h.settings.title+" - "+j.title);c.removeClass(i,"mceTitle");c.setAttrib(h.id,"aria-valuenow",j.title)}else{c.setHTML(i,c.encode(h.settings.title));c.setHTML(g,c.encode(h.settings.title));c.addClass(i,"mceTitle");h.selectedValue=h.selectedIndex=null;c.setAttrib(h.id,"aria-valuenow",h.settings.title)}i=0}},add:function(i,f,h){var g=this;h=h||{};h=d.extend(h,{title:i,value:f});g.items.push(h);g.onAdd.dispatch(g,h)},getLength:function(){return this.items.length},renderHTML:function(){var i="",f=this,g=f.settings,j=f.classPrefix;i='<span role="listbox" aria-haspopup="true" aria-labelledby="'+f.id+'_voiceDesc" aria-describedby="'+f.id+'_voiceDesc"><table role="presentation" tabindex="0" id="'+f.id+'" cellpadding="0" cellspacing="0" class="'+j+" "+j+"Enabled"+(g["class"]?(" "+g["class"]):"")+'"><tbody><tr>';i+="<td>"+c.createHTML("span",{id:f.id+"_voiceDesc","class":"voiceLabel",style:"display:none;"},f.settings.title);i+=c.createHTML("a",{id:f.id+"_text",tabindex:-1,href:"javascript:;","class":"mceText",onclick:"return false;",onmousedown:"return false;"},c.encode(f.settings.title))+"</td>";i+="<td>"+c.createHTML("a",{id:f.id+"_open",tabindex:-1,href:"javascript:;","class":"mceOpen",onclick:"return false;",onmousedown:"return false;"},'<span><span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span></span>')+"</td>";i+="</tr></tbody></table></span>";return i},showMenu:function(){var g=this,i,h=c.get(this.id),f;if(g.isDisabled()||g.items.length==0){return}if(g.menu&&g.menu.isMenuVisible){return g.hideMenu()}if(!g.isMenuRendered){g.renderMenu();g.isMenuRendered=true}i=c.getPos(h);f=g.menu;f.settings.offset_x=i.x;f.settings.offset_y=i.y;f.settings.keyboard_focus=!d.isOpera;if(g.oldID){f.items[g.oldID].setSelected(0)}e(g.items,function(j){if(j.value===g.selectedValue){f.items[j.id].setSelected(1);g.oldID=j.id}});f.showMenu(0,h.clientHeight);b.add(c.doc,"mousedown",g.hideMenu,g);c.addClass(g.id,g.classPrefix+"Selected")},hideMenu:function(g){var f=this;if(f.menu&&f.menu.isMenuVisible){c.removeClass(f.id,f.classPrefix+"Selected");if(g&&g.type=="mousedown"&&(g.target.id==f.id+"_text"||g.target.id==f.id+"_open")){return}if(!g||!c.getParent(g.target,".mceMenu")){c.removeClass(f.id,f.classPrefix+"Selected");b.remove(c.doc,"mousedown",f.hideMenu,f);f.menu.hideMenu()}}},renderMenu:function(){var g=this,f;f=g.settings.control_manager.createDropMenu(g.id+"_menu",{menu_line:1,"class":g.classPrefix+"Menu mceNoIcons",max_width:150,max_height:150});f.onHideMenu.add(function(){g.hideMenu();g.focus()});f.add({title:g.settings.title,"class":"mceMenuItemTitle",onclick:function(){if(g.settings.onselect("")!==false){g.select("")}}});e(g.items,function(h){if(h.value===undefined){f.add({title:h.title,role:"option","class":"mceMenuItemTitle",onclick:function(){if(g.settings.onselect("")!==false){g.select("")}}})}else{h.id=c.uniqueId();h.role="option";h.onclick=function(){if(g.settings.onselect(h.value)!==false){g.select(h.value)}};f.add(h)}});g.onRenderMenu.dispatch(g,f);g.menu=f},postRender:function(){var f=this,g=f.classPrefix;b.add(f.id,"click",f.showMenu,f);b.add(f.id,"keydown",function(h){if(h.keyCode==32){f.showMenu(h);b.cancel(h)}});b.add(f.id,"focus",function(){if(!f._focused){f.keyDownHandler=b.add(f.id,"keydown",function(h){if(h.keyCode==40){f.showMenu();b.cancel(h)}});f.keyPressHandler=b.add(f.id,"keypress",function(i){var h;if(i.keyCode==13){h=f.selectedValue;f.selectedValue=null;b.cancel(i);f.settings.onselect(h)}})}f._focused=1});b.add(f.id,"blur",function(){b.remove(f.id,"keydown",f.keyDownHandler);b.remove(f.id,"keypress",f.keyPressHandler);f._focused=0});if(d.isIE6||!c.boxModel){b.add(f.id,"mouseover",function(){if(!c.hasClass(f.id,g+"Disabled")){c.addClass(f.id,g+"Hover")}});b.add(f.id,"mouseout",function(){if(!c.hasClass(f.id,g+"Disabled")){c.removeClass(f.id,g+"Hover")}})}f.onPostRender.dispatch(f,c.get(f.id))},destroy:function(){this.parent();b.clear(this.id+"_text");b.clear(this.id+"_open")}})})(tinymce);(function(d){var c=d.DOM,b=d.dom.Event,e=d.each,a=d.util.Dispatcher;d.create("tinymce.ui.NativeListBox:tinymce.ui.ListBox",{NativeListBox:function(g,f){this.parent(g,f);this.classPrefix="mceNativeListBox"},setDisabled:function(f){c.get(this.id).disabled=f;this.setAriaProperty("disabled",f)},isDisabled:function(){return c.get(this.id).disabled},select:function(h){var g=this,j,i;if(h==undefined){return g.selectByIndex(-1)}if(h&&h.call){i=h}else{i=function(f){return f==h}}if(h!=g.selectedValue){e(g.items,function(k,f){if(i(k.value)){j=1;g.selectByIndex(f);return false}});if(!j){g.selectByIndex(-1)}}},selectByIndex:function(f){c.get(this.id).selectedIndex=f+1;this.selectedValue=this.items[f]?this.items[f].value:null},add:function(j,g,f){var i,h=this;f=f||{};f.value=g;if(h.isRendered()){c.add(c.get(this.id),"option",f,j)}i={title:j,value:g,attribs:f};h.items.push(i);h.onAdd.dispatch(h,i)},getLength:function(){return this.items.length},renderHTML:function(){var g,f=this;g=c.createHTML("option",{value:""},"-- "+f.settings.title+" --");e(f.items,function(h){g+=c.createHTML("option",{value:h.value},h.title)});g=c.createHTML("select",{id:f.id,"class":"mceNativeListBox","aria-labelledby":f.id+"_aria"},g);g+=c.createHTML("span",{id:f.id+"_aria",style:"display: none"},f.settings.title);return g},postRender:function(){var g=this,h,i=true;g.rendered=true;function f(k){var j=g.items[k.target.selectedIndex-1];if(j&&(j=j.value)){g.onChange.dispatch(g,j);if(g.settings.onselect){g.settings.onselect(j)}}}b.add(g.id,"change",f);b.add(g.id,"keydown",function(k){var j;b.remove(g.id,"change",h);i=false;j=b.add(g.id,"blur",function(){if(i){return}i=true;b.add(g.id,"change",f);b.remove(g.id,"blur",j)});if(d.isWebKit&&(k.keyCode==37||k.keyCode==39)){return b.prevent(k)}if(k.keyCode==13||k.keyCode==32){f(k);return b.cancel(k)}});g.onPostRender.dispatch(g,c.get(g.id))}})})(tinymce);(function(c){var b=c.DOM,a=c.dom.Event,d=c.each;c.create("tinymce.ui.MenuButton:tinymce.ui.Button",{MenuButton:function(g,f,e){this.parent(g,f,e);this.onRenderMenu=new c.util.Dispatcher(this);f.menu_container=f.menu_container||b.doc.body},showMenu:function(){var g=this,j,i,h=b.get(g.id),f;if(g.isDisabled()){return}if(!g.isMenuRendered){g.renderMenu();g.isMenuRendered=true}if(g.isMenuVisible){return g.hideMenu()}j=b.getPos(g.settings.menu_container);i=b.getPos(h);f=g.menu;f.settings.offset_x=i.x;f.settings.offset_y=i.y;f.settings.vp_offset_x=i.x;f.settings.vp_offset_y=i.y;f.settings.keyboard_focus=g._focused;f.showMenu(0,h.clientHeight);a.add(b.doc,"mousedown",g.hideMenu,g);g.setState("Selected",1);g.isMenuVisible=1},renderMenu:function(){var f=this,e;e=f.settings.control_manager.createDropMenu(f.id+"_menu",{menu_line:1,"class":this.classPrefix+"Menu",icons:f.settings.icons});e.onHideMenu.add(function(){f.hideMenu();f.focus()});f.onRenderMenu.dispatch(f,e);f.menu=e},hideMenu:function(g){var f=this;if(g&&g.type=="mousedown"&&b.getParent(g.target,function(h){return h.id===f.id||h.id===f.id+"_open"})){return}if(!g||!b.getParent(g.target,".mceMenu")){f.setState("Selected",0);a.remove(b.doc,"mousedown",f.hideMenu,f);if(f.menu){f.menu.hideMenu()}}f.isMenuVisible=0},postRender:function(){var e=this,f=e.settings;a.add(e.id,"click",function(){if(!e.isDisabled()){if(f.onclick){f.onclick(e.value)}e.showMenu()}})}})})(tinymce);(function(c){var b=c.DOM,a=c.dom.Event,d=c.each;c.create("tinymce.ui.SplitButton:tinymce.ui.MenuButton",{SplitButton:function(g,f,e){this.parent(g,f,e);this.classPrefix="mceSplitButton"},renderHTML:function(){var i,f=this,g=f.settings,e;i="<tbody><tr>";if(g.image){e=b.createHTML("img ",{src:g.image,role:"presentation","class":"mceAction "+g["class"]})}else{e=b.createHTML("span",{"class":"mceAction "+g["class"]},"")}e+=b.createHTML("span",{"class":"mceVoiceLabel mceIconOnly",id:f.id+"_voice",style:"display:none;"},g.title);i+="<td >"+b.createHTML("a",{role:"button",id:f.id+"_action",tabindex:"-1",href:"javascript:;","class":"mceAction "+g["class"],onclick:"return false;",onmousedown:"return false;",title:g.title},e)+"</td>";e=b.createHTML("span",{"class":"mceOpen "+g["class"]},'<span style="display:none;" class="mceIconOnly" aria-hidden="true">\u25BC</span>');i+="<td >"+b.createHTML("a",{role:"button",id:f.id+"_open",tabindex:"-1",href:"javascript:;","class":"mceOpen "+g["class"],onclick:"return false;",onmousedown:"return false;",title:g.title},e)+"</td>";i+="</tr></tbody>";i=b.createHTML("table",{role:"presentation","class":"mceSplitButton mceSplitButtonEnabled "+g["class"],cellpadding:"0",cellspacing:"0",title:g.title},i);return b.createHTML("div",{id:f.id,role:"button",tabindex:"0","aria-labelledby":f.id+"_voice","aria-haspopup":"true"},i)},postRender:function(){var e=this,g=e.settings,f;if(g.onclick){f=function(h){if(!e.isDisabled()){g.onclick(e.value);a.cancel(h)}};a.add(e.id+"_action","click",f);a.add(e.id,["click","keydown"],function(h){var k=32,m=14,i=13,j=38,l=40;if((h.keyCode===32||h.keyCode===13||h.keyCode===14)&&!h.altKey&&!h.ctrlKey&&!h.metaKey){f();a.cancel(h)}else{if(h.type==="click"||h.keyCode===l){e.showMenu();a.cancel(h)}}})}a.add(e.id+"_open","click",function(h){e.showMenu();a.cancel(h)});a.add([e.id,e.id+"_open"],"focus",function(){e._focused=1});a.add([e.id,e.id+"_open"],"blur",function(){e._focused=0});if(c.isIE6||!b.boxModel){a.add(e.id,"mouseover",function(){if(!b.hasClass(e.id,"mceSplitButtonDisabled")){b.addClass(e.id,"mceSplitButtonHover")}});a.add(e.id,"mouseout",function(){if(!b.hasClass(e.id,"mceSplitButtonDisabled")){b.removeClass(e.id,"mceSplitButtonHover")}})}},destroy:function(){this.parent();a.clear(this.id+"_action");a.clear(this.id+"_open");a.clear(this.id)}})})(tinymce);(function(d){var c=d.DOM,a=d.dom.Event,b=d.is,e=d.each;d.create("tinymce.ui.ColorSplitButton:tinymce.ui.SplitButton",{ColorSplitButton:function(i,h,f){var g=this;g.parent(i,h,f);g.settings=h=d.extend({colors:"000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,008000,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF",grid_width:8,default_color:"#888888"},g.settings);g.onShowMenu=new d.util.Dispatcher(g);g.onHideMenu=new d.util.Dispatcher(g);g.value=h.default_color},showMenu:function(){var f=this,g,j,i,h;if(f.isDisabled()){return}if(!f.isMenuRendered){f.renderMenu();f.isMenuRendered=true}if(f.isMenuVisible){return f.hideMenu()}i=c.get(f.id);c.show(f.id+"_menu");c.addClass(i,"mceSplitButtonSelected");h=c.getPos(i);c.setStyles(f.id+"_menu",{left:h.x,top:h.y+i.clientHeight,zIndex:200000});i=0;a.add(c.doc,"mousedown",f.hideMenu,f);f.onShowMenu.dispatch(f);if(f._focused){f._keyHandler=a.add(f.id+"_menu","keydown",function(k){if(k.keyCode==27){f.hideMenu()}});c.select("a",f.id+"_menu")[0].focus()}f.isMenuVisible=1},hideMenu:function(g){var f=this;if(f.isMenuVisible){if(g&&g.type=="mousedown"&&c.getParent(g.target,function(h){return h.id===f.id+"_open"})){return}if(!g||!c.getParent(g.target,".mceSplitButtonMenu")){c.removeClass(f.id,"mceSplitButtonSelected");a.remove(c.doc,"mousedown",f.hideMenu,f);a.remove(f.id+"_menu","keydown",f._keyHandler);c.hide(f.id+"_menu")}f.isMenuVisible=0;f.onHideMenu.dispatch()}},renderMenu:function(){var p=this,h,k=0,q=p.settings,g,j,l,o,f;o=c.add(q.menu_container,"div",{role:"listbox",id:p.id+"_menu","class":q.menu_class+" "+q["class"],style:"position:absolute;left:0;top:-1000px;"});h=c.add(o,"div",{"class":q["class"]+" mceSplitButtonMenu"});c.add(h,"span",{"class":"mceMenuLine"});g=c.add(h,"table",{role:"presentation","class":"mceColorSplitMenu"});j=c.add(g,"tbody");k=0;e(b(q.colors,"array")?q.colors:q.colors.split(","),function(i){i=i.replace(/^#/,"");if(!k--){l=c.add(j,"tr");k=q.grid_width-1}g=c.add(l,"td");g=c.add(g,"a",{role:"option",href:"javascript:;",style:{backgroundColor:"#"+i},title:p.editor.getLang("colors."+i,i),"data-mce-color":"#"+i});if(p.editor.forcedHighContrastMode){g=c.add(g,"canvas",{width:16,height:16,"aria-hidden":"true"});if(g.getContext&&(f=g.getContext("2d"))){f.fillStyle="#"+i;f.fillRect(0,0,16,16)}else{c.remove(g)}}});if(q.more_colors_func){g=c.add(j,"tr");g=c.add(g,"td",{colspan:q.grid_width,"class":"mceMoreColors"});g=c.add(g,"a",{role:"option",id:p.id+"_more",href:"javascript:;",onclick:"return false;","class":"mceMoreColors"},q.more_colors_title);a.add(g,"click",function(i){q.more_colors_func.call(q.more_colors_scope||this);return a.cancel(i)})}c.addClass(h,"mceColorSplitMenu");new d.ui.KeyboardNavigation({root:p.id+"_menu",items:c.select("a",p.id+"_menu"),onCancel:function(){p.hideMenu();p.focus()}});a.add(p.id+"_menu","mousedown",function(i){return a.cancel(i)});a.add(p.id+"_menu","click",function(i){var m;i=c.getParent(i.target,"a",j);if(i&&i.nodeName.toLowerCase()=="a"&&(m=i.getAttribute("data-mce-color"))){p.setColor(m)}return a.cancel(i)});return o},setColor:function(f){this.displayColor(f);this.hideMenu();this.settings.onselect(f)},displayColor:function(g){var f=this;c.setStyle(f.id+"_preview","backgroundColor",g);f.value=g},postRender:function(){var f=this,g=f.id;f.parent();c.add(g+"_action","div",{id:g+"_preview","class":"mceColorPreview"});c.setStyle(f.id+"_preview","backgroundColor",f.value)},destroy:function(){this.parent();a.clear(this.id+"_menu");a.clear(this.id+"_more");c.remove(this.id+"_menu")}})})(tinymce);(function(b){var d=b.DOM,c=b.each,a=b.dom.Event;b.create("tinymce.ui.ToolbarGroup:tinymce.ui.Container",{renderHTML:function(){var f=this,i=[],e=f.controls,j=b.each,g=f.settings;i.push('<div id="'+f.id+'" role="group" aria-labelledby="'+f.id+'_voice">');i.push("<span role='application'>");i.push('<span id="'+f.id+'_voice" class="mceVoiceLabel" style="display:none;">'+d.encode(g.name)+"</span>");j(e,function(h){i.push(h.renderHTML())});i.push("</span>");i.push("</div>");return i.join("")},focus:function(){var e=this;d.get(e.id).focus()},postRender:function(){var f=this,e=[];c(f.controls,function(g){c(g.controls,function(h){if(h.id){e.push(h)}})});f.keyNav=new b.ui.KeyboardNavigation({root:f.id,items:e,onCancel:function(){if(b.isWebKit){d.get(f.editor.id+"_ifr").focus()}f.editor.focus()},excludeFromTabOrder:!f.settings.tab_focus_toolbar})},destroy:function(){var e=this;e.parent();e.keyNav.destroy();a.clear(e.id)}})})(tinymce);(function(a){var c=a.DOM,b=a.each;a.create("tinymce.ui.Toolbar:tinymce.ui.Container",{renderHTML:function(){var m=this,f="",j,k,n=m.settings,e,d,g,l;l=m.controls;for(e=0;e<l.length;e++){k=l[e];d=l[e-1];g=l[e+1];if(e===0){j="mceToolbarStart";if(k.Button){j+=" mceToolbarStartButton"}else{if(k.SplitButton){j+=" mceToolbarStartSplitButton"}else{if(k.ListBox){j+=" mceToolbarStartListBox"}}}f+=c.createHTML("td",{"class":j},c.createHTML("span",null,"<!-- IE -->"))}if(d&&k.ListBox){if(d.Button||d.SplitButton){f+=c.createHTML("td",{"class":"mceToolbarEnd"},c.createHTML("span",null,"<!-- IE -->"))}}if(c.stdMode){f+='<td style="position: relative">'+k.renderHTML()+"</td>"}else{f+="<td>"+k.renderHTML()+"</td>"}if(g&&k.ListBox){if(g.Button||g.SplitButton){f+=c.createHTML("td",{"class":"mceToolbarStart"},c.createHTML("span",null,"<!-- IE -->"))}}}j="mceToolbarEnd";if(k.Button){j+=" mceToolbarEndButton"}else{if(k.SplitButton){j+=" mceToolbarEndSplitButton"}else{if(k.ListBox){j+=" mceToolbarEndListBox"}}}f+=c.createHTML("td",{"class":j},c.createHTML("span",null,"<!-- IE -->"));return c.createHTML("table",{id:m.id,"class":"mceToolbar"+(n["class"]?" "+n["class"]:""),cellpadding:"0",cellspacing:"0",align:m.settings.align||"",role:"presentation",tabindex:"-1"},"<tbody><tr>"+f+"</tr></tbody>")}})})(tinymce);(function(b){var a=b.util.Dispatcher,c=b.each;b.create("tinymce.AddOnManager",{AddOnManager:function(){var d=this;d.items=[];d.urls={};d.lookup={};d.onAdd=new a(d)},get:function(d){if(this.lookup[d]){return this.lookup[d].instance}else{return undefined}},dependencies:function(e){var d;if(this.lookup[e]){d=this.lookup[e].dependencies}return d||[]},requireLangPack:function(e){var d=b.settings;if(d&&d.language&&d.language_load!==false){b.ScriptLoader.add(this.urls[e]+"/langs/"+d.language+".js")}},add:function(f,e,d){this.items.push(e);this.lookup[f]={instance:e,dependencies:d};this.onAdd.dispatch(this,f,e);return e},createUrl:function(d,e){if(typeof e==="object"){return e}else{return{prefix:d.prefix,resource:e,suffix:d.suffix}}},addComponents:function(f,d){var e=this.urls[f];b.each(d,function(g){b.ScriptLoader.add(e+"/"+g)})},load:function(j,f,d,h){var g=this,e=f;function i(){var k=g.dependencies(j);b.each(k,function(m){var l=g.createUrl(f,m);g.load(l.resource,l,undefined,undefined)});if(d){if(h){d.call(h)}else{d.call(b.ScriptLoader)}}}if(g.urls[j]){return}if(typeof f==="object"){e=f.prefix+f.resource+f.suffix}if(e.indexOf("/")!=0&&e.indexOf("://")==-1){e=b.baseURL+"/"+e}g.urls[j]=e.substring(0,e.lastIndexOf("/"));if(g.lookup[j]){i()}else{b.ScriptLoader.add(e,i,h)}}});b.PluginManager=new b.AddOnManager();b.ThemeManager=new b.AddOnManager()}(tinymce));(function(j){var g=j.each,d=j.extend,k=j.DOM,i=j.dom.Event,f=j.ThemeManager,b=j.PluginManager,e=j.explode,h=j.util.Dispatcher,a,c=0;j.documentBaseURL=window.location.href.replace(/[\?#].*$/,"").replace(/[\/\\][^\/]+$/,"");if(!/[\/\\]$/.test(j.documentBaseURL)){j.documentBaseURL+="/"}j.baseURL=new j.util.URI(j.documentBaseURL).toAbsolute(j.baseURL);j.baseURI=new j.util.URI(j.baseURL);j.onBeforeUnload=new h(j);i.add(window,"beforeunload",function(l){j.onBeforeUnload.dispatch(j,l)});j.onAddEditor=new h(j);j.onRemoveEditor=new h(j);j.EditorManager=d(j,{editors:[],i18n:{},activeEditor:null,init:function(q){var n=this,p,l=j.ScriptLoader,u,o=[],m;function r(x,y,t){var v=x[y];if(!v){return}if(j.is(v,"string")){t=v.replace(/\.\w+$/,"");t=t?j.resolve(t):0;v=j.resolve(v)}return v.apply(t||this,Array.prototype.slice.call(arguments,2))}q=d({theme:"simple",language:"en"},q);n.settings=q;i.add(document,"init",function(){var s,v;r(q,"onpageload");switch(q.mode){case"exact":s=q.elements||"";if(s.length>0){g(e(s),function(x){if(k.get(x)){m=new j.Editor(x,q);o.push(m);m.render(1)}else{g(document.forms,function(y){g(y.elements,function(z){if(z.name===x){x="mce_editor_"+c++;k.setAttrib(z,"id",x);m=new j.Editor(x,q);o.push(m);m.render(1)}})})}})}break;case"textareas":case"specific_textareas":function t(y,x){return x.constructor===RegExp?x.test(y.className):k.hasClass(y,x)}g(k.select("textarea"),function(x){if(q.editor_deselector&&t(x,q.editor_deselector)){return}if(!q.editor_selector||t(x,q.editor_selector)){u=k.get(x.name);if(!x.id&&!u){x.id=x.name}if(!x.id||n.get(x.id)){x.id=k.uniqueId()}m=new j.Editor(x.id,q);o.push(m);m.render(1)}});break}if(q.oninit){s=v=0;g(o,function(x){v++;if(!x.initialized){x.onInit.add(function(){s++;if(s==v){r(q,"oninit")}})}else{s++}if(s==v){r(q,"oninit")}})}})},get:function(l){if(l===a){return this.editors}return this.editors[l]},getInstanceById:function(l){return this.get(l)},add:function(m){var l=this,n=l.editors;n[m.id]=m;n.push(m);l._setActive(m);l.onAddEditor.dispatch(l,m);return m},remove:function(n){var m=this,l,o=m.editors;if(!o[n.id]){return null}delete o[n.id];for(l=0;l<o.length;l++){if(o[l]==n){o.splice(l,1);break}}if(m.activeEditor==n){m._setActive(o[0])}n.destroy();m.onRemoveEditor.dispatch(m,n);return n},execCommand:function(r,p,o){var q=this,n=q.get(o),l;switch(r){case"mceFocus":n.focus();return true;case"mceAddEditor":case"mceAddControl":if(!q.get(o)){new j.Editor(o,q.settings).render()}return true;case"mceAddFrameControl":l=o.window;l.tinyMCE=tinyMCE;l.tinymce=j;j.DOM.doc=l.document;j.DOM.win=l;n=new j.Editor(o.element_id,o);n.render();if(j.isIE){function m(){n.destroy();l.detachEvent("onunload",m);l=l.tinyMCE=l.tinymce=null}l.attachEvent("onunload",m)}o.page_window=null;return true;case"mceRemoveEditor":case"mceRemoveControl":if(n){n.remove()}return true;case"mceToggleEditor":if(!n){q.execCommand("mceAddControl",0,o);return true}if(n.isHidden()){n.show()}else{n.hide()}return true}if(q.activeEditor){return q.activeEditor.execCommand(r,p,o)}return false},execInstanceCommand:function(p,o,n,m){var l=this.get(p);if(l){return l.execCommand(o,n,m)}return false},triggerSave:function(){g(this.editors,function(l){l.save()})},addI18n:function(n,q){var l,m=this.i18n;if(!j.is(n,"string")){g(n,function(r,p){g(r,function(t,s){g(t,function(v,u){if(s==="common"){m[p+"."+u]=v}else{m[p+"."+s+"."+u]=v}})})})}else{g(q,function(r,p){m[n+"."+p]=r})}},_setActive:function(l){this.selectedInstance=this.activeEditor=l}})})(tinymce);(function(m){var n=m.DOM,j=m.dom.Event,f=m.extend,k=m.util.Dispatcher,i=m.each,a=m.isGecko,b=m.isIE,e=m.isWebKit,d=m.is,h=m.ThemeManager,c=m.PluginManager,o=m.inArray,l=m.grep,g=m.explode;m.create("tinymce.Editor",{Editor:function(r,q){var p=this;p.id=p.editorId=r;p.execCommands={};p.queryStateCommands={};p.queryValueCommands={};p.isNotDirty=false;p.plugins={};i(["onPreInit","onBeforeRenderUI","onPostRender","onInit","onRemove","onActivate","onDeactivate","onClick","onEvent","onMouseUp","onMouseDown","onDblClick","onKeyDown","onKeyUp","onKeyPress","onContextMenu","onSubmit","onReset","onPaste","onPreProcess","onPostProcess","onBeforeSetContent","onBeforeGetContent","onSetContent","onGetContent","onLoadContent","onSaveContent","onNodeChange","onChange","onBeforeExecCommand","onExecCommand","onUndo","onRedo","onVisualAid","onSetProgressState"],function(s){p[s]=new k(p)});p.settings=q=f({id:r,language:"en",docs_language:"en",theme:"simple",skin:"default",delta_width:0,delta_height:0,popup_css:"",plugins:"",document_base_url:m.documentBaseURL,add_form_submit_trigger:1,submit_patch:1,add_unload_trigger:1,convert_urls:1,relative_urls:1,remove_script_host:1,table_inline_editing:0,object_resizing:1,cleanup:1,accessibility_focus:1,custom_shortcuts:1,custom_undo_redo_keyboard_shortcuts:1,custom_undo_redo_restore_selection:1,custom_undo_redo:1,doctype:m.isIE6?'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">':"<!DOCTYPE>",visual_table_class:"mceItemTable",visual:1,font_size_style_values:"xx-small,x-small,small,medium,large,x-large,xx-large",font_size_legacy_values:"xx-small,small,medium,large,x-large,xx-large,300%",apply_source_formatting:1,directionality:"ltr",forced_root_block:"p",hidden_input:1,padd_empty_editor:1,render_ui:1,init_theme:1,force_p_newlines:1,indentation:"30px",keep_styles:1,fix_table_elements:1,inline_styles:1,convert_fonts_to_spans:true,indent:"simple",indent_before:"p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr",indent_after:"p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr",validate:true,entity_encoding:"named",url_converter:p.convertURL,url_converter_scope:p,ie7_compat:true},q);p.documentBaseURI=new m.util.URI(q.document_base_url||m.documentBaseURL,{base_uri:tinyMCE.baseURI});p.baseURI=m.baseURI;p.contentCSS=[];p.execCallback("setup",p)},render:function(r){var u=this,v=u.settings,x=u.id,p=m.ScriptLoader;if(!j.domLoaded){j.add(document,"init",function(){u.render()});return}tinyMCE.settings=v;if(!u.getElement()){return}if(m.isIDevice&&!m.isIOS5){return}if(!/TEXTAREA|INPUT/i.test(u.getElement().nodeName)&&v.hidden_input&&n.getParent(x,"form")){n.insertAfter(n.create("input",{type:"hidden",name:x}),x)}if(m.WindowManager){u.windowManager=new m.WindowManager(u)}if(v.encoding=="xml"){u.onGetContent.add(function(s,t){if(t.save){t.content=n.encode(t.content)}})}if(v.add_form_submit_trigger){u.onSubmit.addToTop(function(){if(u.initialized){u.save();u.isNotDirty=1}})}if(v.add_unload_trigger){u._beforeUnload=tinyMCE.onBeforeUnload.add(function(){if(u.initialized&&!u.destroyed&&!u.isHidden()){u.save({format:"raw",no_events:true})}})}m.addUnload(u.destroy,u);if(v.submit_patch){u.onBeforeRenderUI.add(function(){var s=u.getElement().form;if(!s){return}if(s._mceOldSubmit){return}if(!s.submit.nodeType&&!s.submit.length){u.formElement=s;s._mceOldSubmit=s.submit;s.submit=function(){m.triggerSave();u.isNotDirty=1;return u.formElement._mceOldSubmit(u.formElement)}}s=null})}function q(){if(v.language&&v.language_load!==false){p.add(m.baseURL+"/langs/"+v.language+".js")}if(v.theme&&v.theme.charAt(0)!="-"&&!h.urls[v.theme]){h.load(v.theme,"themes/"+v.theme+"/editor_template"+m.suffix+".js")}i(g(v.plugins),function(t){if(t&&!c.urls[t]){if(t.charAt(0)=="-"){t=t.substr(1,t.length);var s=c.dependencies(t);i(s,function(z){var y={prefix:"plugins/",resource:z,suffix:"/editor_plugin"+m.suffix+".js"};var z=c.createUrl(y,z);c.load(z.resource,z)})}else{if(t=="safari"){return}c.load(t,{prefix:"plugins/",resource:t,suffix:"/editor_plugin"+m.suffix+".js"})}}});p.loadQueue(function(){if(!u.removed){u.init()}})}q()},init:function(){var r,H=this,I=H.settings,E,A,D=H.getElement(),q,p,F,y,C,G,z,v=[];m.add(H);I.aria_label=I.aria_label||n.getAttrib(D,"aria-label",H.getLang("aria.rich_text_area"));if(I.theme){I.theme=I.theme.replace(/-/,"");q=h.get(I.theme);H.theme=new q();if(H.theme.init&&I.init_theme){H.theme.init(H,h.urls[I.theme]||m.documentBaseURL.replace(/\/$/,""))}}function B(J){var K=c.get(J),t=c.urls[J]||m.documentBaseURL.replace(/\/$/,""),s;if(K&&m.inArray(v,J)===-1){i(c.dependencies(J),function(u){B(u)});s=new K(H,t);H.plugins[J]=s;if(s.init){s.init(H,t);v.push(J)}}}i(g(I.plugins.replace(/\-/g,"")),B);if(I.popup_css!==false){if(I.popup_css){I.popup_css=H.documentBaseURI.toAbsolute(I.popup_css)}else{I.popup_css=H.baseURI.toAbsolute("themes/"+I.theme+"/skins/"+I.skin+"/dialog.css")}}if(I.popup_css_add){I.popup_css+=","+H.documentBaseURI.toAbsolute(I.popup_css_add)}H.controlManager=new m.ControlManager(H);if(I.custom_undo_redo){H.onBeforeExecCommand.add(function(t,J,u,K,s){if(J!="Undo"&&J!="Redo"&&J!="mceRepaint"&&(!s||!s.skip_undo)){H.undoManager.beforeChange()}});H.onExecCommand.add(function(t,J,u,K,s){if(J!="Undo"&&J!="Redo"&&J!="mceRepaint"&&(!s||!s.skip_undo)){H.undoManager.add()}})}H.onExecCommand.add(function(s,t){if(!/^(FontName|FontSize)$/.test(t)){H.nodeChanged()}});if(a){function x(s,t){if(!t||!t.initial){H.execCommand("mceRepaint")}}H.onUndo.add(x);H.onRedo.add(x);H.onSetContent.add(x)}H.onBeforeRenderUI.dispatch(H,H.controlManager);if(I.render_ui){E=I.width||D.style.width||D.offsetWidth;A=I.height||D.style.height||D.offsetHeight;H.orgDisplay=D.style.display;G=/^[0-9\.]+(|px)$/i;if(G.test(""+E)){E=Math.max(parseInt(E)+(q.deltaWidth||0),100)}if(G.test(""+A)){A=Math.max(parseInt(A)+(q.deltaHeight||0),100)}q=H.theme.renderUI({targetNode:D,width:E,height:A,deltaWidth:I.delta_width,deltaHeight:I.delta_height});H.editorContainer=q.editorContainer}if(document.domain&&location.hostname!=document.domain){m.relaxedDomain=document.domain}n.setStyles(q.sizeContainer||q.editorContainer,{width:E,height:A});if(I.content_css){m.each(g(I.content_css),function(s){H.contentCSS.push(H.documentBaseURI.toAbsolute(s))})}A=(q.iframeHeight||A)+(typeof(A)=="number"?(q.deltaHeight||0):"");if(A<100){A=100}H.iframeHTML=I.doctype+'<html><head xmlns="http://www.w3.org/1999/xhtml">';if(I.document_base_url!=m.documentBaseURL){H.iframeHTML+='<base href="'+H.documentBaseURI.getURI()+'" />'}if(I.ie7_compat){H.iframeHTML+='<meta http-equiv="X-UA-Compatible" content="IE=7" />'}else{H.iframeHTML+='<meta http-equiv="X-UA-Compatible" content="IE=edge" />'}H.iframeHTML+='<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';for(z=0;z<H.contentCSS.length;z++){H.iframeHTML+='<link type="text/css" rel="stylesheet" href="'+H.contentCSS[z]+'" />'}y=I.body_id||"tinymce";if(y.indexOf("=")!=-1){y=H.getParam("body_id","","hash");y=y[H.id]||y}C=I.body_class||"";if(C.indexOf("=")!=-1){C=H.getParam("body_class","","hash");C=C[H.id]||""}H.iframeHTML+='</head><body id="'+y+'" class="mceContentBody '+C+'"><br></body></html>';if(m.relaxedDomain&&(b||(m.isOpera&&parseFloat(opera.version())<11))){F='javascript:(function(){document.open();document.domain="'+document.domain+'";var ed = window.parent.tinyMCE.get("'+H.id+'");document.write(ed.iframeHTML);document.close();ed.setupIframe();})()'}r=n.add(q.iframeContainer,"iframe",{id:H.id+"_ifr",src:F||'javascript:""',frameBorder:"0",allowTransparency:"true",title:I.aria_label,style:{width:"100%",height:A,display:"block"}});H.contentAreaContainer=q.iframeContainer;n.get(q.editorContainer).style.display=H.orgDisplay;n.get(H.id).style.display="none";n.setAttrib(H.id,"aria-hidden",true);if(!m.relaxedDomain||!F){H.setupIframe()}D=r=q=null},setupIframe:function(){var q=this,v=q.settings,x=n.get(q.id),y=q.getDoc(),u,p;if(!b||!m.relaxedDomain){y.open();y.write(q.iframeHTML);y.close();if(m.relaxedDomain){y.domain=m.relaxedDomain}}p=q.getBody();p.disabled=true;if(!v.readonly){p.contentEditable=true}p.disabled=false;q.schema=new m.html.Schema(v);q.dom=new m.dom.DOMUtils(q.getDoc(),{keep_values:true,url_converter:q.convertURL,url_converter_scope:q,hex_colors:v.force_hex_style_colors,class_filter:v.class_filter,update_styles:1,fix_ie_paragraphs:1,schema:q.schema});q.parser=new m.html.DomParser(v,q.schema);if(!q.settings.allow_html_in_named_anchor){q.parser.addAttributeFilter("name",function(s,t){var A=s.length,C,z,B,D;while(A--){D=s[A];if(D.name==="a"&&D.firstChild){B=D.parent;C=D.lastChild;do{z=C.prev;B.insert(C,D);C=z}while(C)}}})}q.parser.addAttributeFilter("src,href,style",function(s,t){var z=s.length,B,D=q.dom,C,A;while(z--){B=s[z];C=B.attr(t);A="data-mce-"+t;if(!B.attributes.map[A]){if(t==="style"){B.attr(A,D.serializeStyle(D.parseStyle(C),B.name))}else{B.attr(A,q.convertURL(C,t,B.name))}}}});q.parser.addNodeFilter("script",function(s,t){var z=s.length,A;while(z--){A=s[z];A.attr("type","mce-"+(A.attr("type")||"text/javascript"))}});q.parser.addNodeFilter("#cdata",function(s,t){var z=s.length,A;while(z--){A=s[z];A.type=8;A.name="#comment";A.value="[CDATA["+A.value+"]]"}});q.parser.addNodeFilter("p,h1,h2,h3,h4,h5,h6,div",function(t,z){var A=t.length,B,s=q.schema.getNonEmptyElements();while(A--){B=t[A];if(B.isEmpty(s)){B.empty().append(new m.html.Node("br",1)).shortEnded=true}}});q.serializer=new m.dom.Serializer(v,q.dom,q.schema);q.selection=new m.dom.Selection(q.dom,q.getWin(),q.serializer);q.formatter=new m.Formatter(this);q.formatter.register({alignleft:[{selector:"p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",styles:{textAlign:"left"}},{selector:"img,table",collapsed:false,styles:{"float":"left"}}],aligncenter:[{selector:"p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",styles:{textAlign:"center"}},{selector:"img",collapsed:false,styles:{display:"block",marginLeft:"auto",marginRight:"auto"}},{selector:"table",collapsed:false,styles:{marginLeft:"auto",marginRight:"auto"}}],alignright:[{selector:"p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",styles:{textAlign:"right"}},{selector:"img,table",collapsed:false,styles:{"float":"right"}}],alignfull:[{selector:"p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",styles:{textAlign:"justify"}}],bold:[{inline:"strong",remove:"all"},{inline:"span",styles:{fontWeight:"bold"}},{inline:"b",remove:"all"}],italic:[{inline:"em",remove:"all"},{inline:"span",styles:{fontStyle:"italic"}},{inline:"i",remove:"all"}],underline:[{inline:"span",styles:{textDecoration:"underline"},exact:true},{inline:"u",remove:"all"}],strikethrough:[{inline:"span",styles:{textDecoration:"line-through"},exact:true},{inline:"strike",remove:"all"}],forecolor:{inline:"span",styles:{color:"%value"},wrap_links:false},hilitecolor:{inline:"span",styles:{backgroundColor:"%value"},wrap_links:false},fontname:{inline:"span",styles:{fontFamily:"%value"}},fontsize:{inline:"span",styles:{fontSize:"%value"}},fontsize_class:{inline:"span",attributes:{"class":"%value"}},blockquote:{block:"blockquote",wrapper:1,remove:"all"},subscript:{inline:"sub"},superscript:{inline:"sup"},link:{inline:"a",selector:"a",remove:"all",split:true,deep:true,onmatch:function(s){return true},onformat:function(z,s,t){i(t,function(B,A){q.dom.setAttrib(z,A,B)})}},removeformat:[{selector:"b,strong,em,i,font,u,strike",remove:"all",split:true,expand:false,block_expand:true,deep:true},{selector:"span",attributes:["style","class"],remove:"empty",split:true,expand:false,deep:true},{selector:"*",attributes:["style","class"],split:false,expand:false,deep:true}]});i("p h1 h2 h3 h4 h5 h6 div address pre div code dt dd samp".split(/\s/),function(s){q.formatter.register(s,{block:s,remove:"all"})});q.formatter.register(q.settings.formats);q.undoManager=new m.UndoManager(q);q.undoManager.onAdd.add(function(t,s){if(t.hasUndo()){return q.onChange.dispatch(q,s,t)}});q.undoManager.onUndo.add(function(t,s){return q.onUndo.dispatch(q,s,t)});q.undoManager.onRedo.add(function(t,s){return q.onRedo.dispatch(q,s,t)});q.forceBlocks=new m.ForceBlocks(q,{forced_root_block:v.forced_root_block});q.editorCommands=new m.EditorCommands(q);q.serializer.onPreProcess.add(function(s,t){return q.onPreProcess.dispatch(q,t,s)});q.serializer.onPostProcess.add(function(s,t){return q.onPostProcess.dispatch(q,t,s)});q.onPreInit.dispatch(q);if(!v.gecko_spellcheck){q.getBody().spellcheck=0}if(!v.readonly){q._addEvents()}q.controlManager.onPostRender.dispatch(q,q.controlManager);q.onPostRender.dispatch(q);q.quirks=new m.util.Quirks(this);if(v.directionality){q.getBody().dir=v.directionality}if(v.nowrap){q.getBody().style.whiteSpace="nowrap"}if(v.handle_node_change_callback){q.onNodeChange.add(function(t,s,z){q.execCallback("handle_node_change_callback",q.id,z,-1,-1,true,q.selection.isCollapsed())})}if(v.save_callback){q.onSaveContent.add(function(s,z){var t=q.execCallback("save_callback",q.id,z.content,q.getBody());if(t){z.content=t}})}if(v.onchange_callback){q.onChange.add(function(t,s){q.execCallback("onchange_callback",q,s)})}if(v.protect){q.onBeforeSetContent.add(function(s,t){if(v.protect){i(v.protect,function(z){t.content=t.content.replace(z,function(A){return"<!--mce:protected "+escape(A)+"-->"})})}})}if(v.convert_newlines_to_brs){q.onBeforeSetContent.add(function(s,t){if(t.initial){t.content=t.content.replace(/\r?\n/g,"<br />")}})}if(v.preformatted){q.onPostProcess.add(function(s,t){t.content=t.content.replace(/^\s*<pre.*?>/,"");t.content=t.content.replace(/<\/pre>\s*$/,"");if(t.set){t.content='<pre class="mceItemHidden">'+t.content+"</pre>"}})}if(v.verify_css_classes){q.serializer.attribValueFilter=function(B,z){var A,t;if(B=="class"){if(!q.classesRE){t=q.dom.getClasses();if(t.length>0){A="";i(t,function(s){A+=(A?"|":"")+s["class"]});q.classesRE=new RegExp("("+A+")","gi")}}return !q.classesRE||/(\bmceItem\w+\b|\bmceTemp\w+\b)/g.test(z)||q.classesRE.test(z)?z:""}return z}}if(v.cleanup_callback){q.onBeforeSetContent.add(function(s,t){t.content=q.execCallback("cleanup_callback","insert_to_editor",t.content,t)});q.onPreProcess.add(function(s,t){if(t.set){q.execCallback("cleanup_callback","insert_to_editor_dom",t.node,t)}if(t.get){q.execCallback("cleanup_callback","get_from_editor_dom",t.node,t)}});q.onPostProcess.add(function(s,t){if(t.set){t.content=q.execCallback("cleanup_callback","insert_to_editor",t.content,t)}if(t.get){t.content=q.execCallback("cleanup_callback","get_from_editor",t.content,t)}})}if(v.save_callback){q.onGetContent.add(function(s,t){if(t.save){t.content=q.execCallback("save_callback",q.id,t.content,q.getBody())}})}if(v.handle_event_callback){q.onEvent.add(function(s,t,z){if(q.execCallback("handle_event_callback",t,s,z)===false){j.cancel(t)}})}q.onSetContent.add(function(){q.addVisual(q.getBody())});if(v.padd_empty_editor){q.onPostProcess.add(function(s,t){t.content=t.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/,"")})}if(a){function r(s,t){i(s.dom.select("a"),function(A){var z=A.parentNode;if(s.dom.isBlock(z)&&z.lastChild===A){s.dom.add(z,"br",{"data-mce-bogus":1})}})}q.onExecCommand.add(function(s,t){if(t==="CreateLink"){r(s)}});q.onSetContent.add(q.selection.onSetContent.add(r))}q.load({initial:true,format:"html"});q.startContent=q.getContent({format:"raw"});q.undoManager.add();q.initialized=true;q.onInit.dispatch(q);q.execCallback("setupcontent_callback",q.id,q.getBody(),q.getDoc());q.execCallback("init_instance_callback",q);q.focus(true);q.nodeChanged({initial:1});i(q.contentCSS,function(s){q.dom.loadCSS(s)});if(v.auto_focus){setTimeout(function(){var s=m.get(v.auto_focus);s.selection.select(s.getBody(),1);s.selection.collapse(1);s.getBody().focus();s.getWin().focus()},100)}x=null},focus:function(u){var y,q=this,s=q.selection,x=q.settings.content_editable,r,p,v=q.getDoc();if(!u){r=s.getRng();if(r.item){p=r.item(0)}q._refreshContentEditable();s.normalize();if(!x){q.getWin().focus()}if(m.isGecko){q.getBody().focus()}if(p&&p.ownerDocument==v){r=v.body.createControlRange();r.addElement(p);r.select()}}if(m.activeEditor!=q){if((y=m.activeEditor)!=null){y.onDeactivate.dispatch(y,q)}q.onActivate.dispatch(q,y)}m._setActive(q)},execCallback:function(u){var p=this,r=p.settings[u],q;if(!r){return}if(p.callbackLookup&&(q=p.callbackLookup[u])){r=q.func;q=q.scope}if(d(r,"string")){q=r.replace(/\.\w+$/,"");q=q?m.resolve(q):0;r=m.resolve(r);p.callbackLookup=p.callbackLookup||{};p.callbackLookup[u]={func:r,scope:q}}return r.apply(q||p,Array.prototype.slice.call(arguments,1))},translate:function(p){var r=this.settings.language||"en",q=m.i18n;if(!p){return""}return q[r+"."+p]||p.replace(/{\#([^}]+)\}/g,function(t,s){return q[r+"."+s]||"{#"+s+"}"})},getLang:function(q,p){return m.i18n[(this.settings.language||"en")+"."+q]||(d(p)?p:"{#"+q+"}")},getParam:function(u,r,p){var s=m.trim,q=d(this.settings[u])?this.settings[u]:r,t;if(p==="hash"){t={};if(d(q,"string")){i(q.indexOf("=")>0?q.split(/[;,](?![^=;,]*(?:[;,]|$))/):q.split(","),function(x){x=x.split("=");if(x.length>1){t[s(x[0])]=s(x[1])}else{t[s(x[0])]=s(x)}})}else{t=q}return t}return q},nodeChanged:function(r){var p=this,q=p.selection,u=q.getStart()||p.getBody();if(p.initialized){r=r||{};u=b&&u.ownerDocument!=p.getDoc()?p.getBody():u;r.parents=[];p.dom.getParent(u,function(s){if(s.nodeName=="BODY"){return true}r.parents.push(s)});p.onNodeChange.dispatch(p,r?r.controlManager||p.controlManager:p.controlManager,u,q.isCollapsed(),r)}},addButton:function(r,q){var p=this;p.buttons=p.buttons||{};p.buttons[r]=q},addCommand:function(p,r,q){this.execCommands[p]={func:r,scope:q||this}},addQueryStateHandler:function(p,r,q){this.queryStateCommands[p]={func:r,scope:q||this}},addQueryValueHandler:function(p,r,q){this.queryValueCommands[p]={func:r,scope:q||this}},addShortcut:function(r,u,p,s){var q=this,v;if(!q.settings.custom_shortcuts){return false}q.shortcuts=q.shortcuts||{};if(d(p,"string")){v=p;p=function(){q.execCommand(v,false,null)}}if(d(p,"object")){v=p;p=function(){q.execCommand(v[0],v[1],v[2])}}i(g(r),function(t){var x={func:p,scope:s||this,desc:u,alt:false,ctrl:false,shift:false};i(g(t,"+"),function(y){switch(y){case"alt":case"ctrl":case"shift":x[y]=true;break;default:x.charCode=y.charCodeAt(0);x.keyCode=y.toUpperCase().charCodeAt(0)}});q.shortcuts[(x.ctrl?"ctrl":"")+","+(x.alt?"alt":"")+","+(x.shift?"shift":"")+","+x.keyCode]=x});return true},execCommand:function(x,v,z,p){var r=this,u=0,y,q;if(!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll)$/.test(x)&&(!p||!p.skip_focus)){r.focus()}y={};r.onBeforeExecCommand.dispatch(r,x,v,z,y);if(y.terminate){return false}if(r.execCallback("execcommand_callback",r.id,r.selection.getNode(),x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);return true}if(y=r.execCommands[x]){q=y.func.call(y.scope,v,z);if(q!==true){r.onExecCommand.dispatch(r,x,v,z,p);return q}}i(r.plugins,function(s){if(s.execCommand&&s.execCommand(x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);u=1;return false}});if(u){return true}if(r.theme&&r.theme.execCommand&&r.theme.execCommand(x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);return true}if(r.editorCommands.execCommand(x,v,z)){r.onExecCommand.dispatch(r,x,v,z,p);return true}r.getDoc().execCommand(x,v,z);r.onExecCommand.dispatch(r,x,v,z,p)},queryCommandState:function(u){var q=this,v,r;if(q._isHidden()){return}if(v=q.queryStateCommands[u]){r=v.func.call(v.scope);if(r!==true){return r}}v=q.editorCommands.queryCommandState(u);if(v!==-1){return v}try{return this.getDoc().queryCommandState(u)}catch(p){}},queryCommandValue:function(v){var q=this,u,r;if(q._isHidden()){return}if(u=q.queryValueCommands[v]){r=u.func.call(u.scope);if(r!==true){return r}}u=q.editorCommands.queryCommandValue(v);if(d(u)){return u}try{return this.getDoc().queryCommandValue(v)}catch(p){}},show:function(){var p=this;n.show(p.getContainer());n.hide(p.id);p.load()},hide:function(){var p=this,q=p.getDoc();if(b&&q){q.execCommand("SelectAll")}p.save();n.hide(p.getContainer());n.setStyle(p.id,"display",p.orgDisplay)},isHidden:function(){return !n.isHidden(this.id)},setProgressState:function(p,q,r){this.onSetProgressState.dispatch(this,p,q,r);return p},load:function(s){var p=this,r=p.getElement(),q;if(r){s=s||{};s.load=true;q=p.setContent(d(r.value)?r.value:r.innerHTML,s);s.element=r;if(!s.no_events){p.onLoadContent.dispatch(p,s)}s.element=r=null;return q}},save:function(u){var p=this,s=p.getElement(),q,r;if(!s||!p.initialized){return}u=u||{};u.save=true;if(!u.no_events){p.undoManager.typing=false;p.undoManager.add()}u.element=s;q=u.content=p.getContent(u);if(!u.no_events){p.onSaveContent.dispatch(p,u)}q=u.content;if(!/TEXTAREA|INPUT/i.test(s.nodeName)){s.innerHTML=q;if(r=n.getParent(p.id,"form")){i(r.elements,function(t){if(t.name==p.id){t.value=q;return false}})}}else{s.value=q}u.element=s=null;return q},setContent:function(u,s){var r=this,q,p=r.getBody(),t;s=s||{};s.format=s.format||"html";s.set=true;s.content=u;if(!s.no_events){r.onBeforeSetContent.dispatch(r,s)}u=s.content;if(!m.isIE&&(u.length===0||/^\s+$/.test(u))){t=r.settings.forced_root_block;if(t){u="<"+t+'><br data-mce-bogus="1"></'+t+">"}else{u='<br data-mce-bogus="1">'}p.innerHTML=u;r.selection.select(p,true);r.selection.collapse(true);return}if(s.format!=="raw"){u=new m.html.Serializer({},r.schema).serialize(r.parser.parse(u))}s.content=m.trim(u);r.dom.setHTML(p,s.content);if(!s.no_events){r.onSetContent.dispatch(r,s)}r.selection.normalize();return s.content},getContent:function(q){var p=this,r;q=q||{};q.format=q.format||"html";q.get=true;if(!q.no_events){p.onBeforeGetContent.dispatch(p,q)}if(q.format=="raw"){r=p.getBody().innerHTML}else{r=p.serializer.serialize(p.getBody(),q)}q.content=m.trim(r);if(!q.no_events){p.onGetContent.dispatch(p,q)}return q.content},isDirty:function(){var p=this;return m.trim(p.startContent)!=m.trim(p.getContent({format:"raw",no_events:1}))&&!p.isNotDirty},getContainer:function(){var p=this;if(!p.container){p.container=n.get(p.editorContainer||p.id+"_parent")}return p.container},getContentAreaContainer:function(){return this.contentAreaContainer},getElement:function(){return n.get(this.settings.content_element||this.id)},getWin:function(){var p=this,q;if(!p.contentWindow){q=n.get(p.id+"_ifr");if(q){p.contentWindow=q.contentWindow}}return p.contentWindow},getDoc:function(){var q=this,p;if(!q.contentDocument){p=q.getWin();if(p){q.contentDocument=p.document}}return q.contentDocument},getBody:function(){return this.bodyElement||this.getDoc().body},convertURL:function(p,x,v){var q=this,r=q.settings;if(r.urlconverter_callback){return q.execCallback("urlconverter_callback",p,v,true,x)}if(!r.convert_urls||(v&&v.nodeName=="LINK")||p.indexOf("file:")===0){return p}if(r.relative_urls){return q.documentBaseURI.toRelative(p)}p=q.documentBaseURI.toAbsolute(p,r.remove_script_host);return p},addVisual:function(r){var p=this,q=p.settings;r=r||p.getBody();if(!d(p.hasVisual)){p.hasVisual=q.visual}i(p.dom.select("table,a",r),function(t){var s;switch(t.nodeName){case"TABLE":s=p.dom.getAttrib(t,"border");if(!s||s=="0"){if(p.hasVisual){p.dom.addClass(t,q.visual_table_class)}else{p.dom.removeClass(t,q.visual_table_class)}}return;case"A":s=p.dom.getAttrib(t,"name");if(s){if(p.hasVisual){p.dom.addClass(t,"mceItemAnchor")}else{p.dom.removeClass(t,"mceItemAnchor")}}return}});p.onVisualAid.dispatch(p,r,p.hasVisual)},remove:function(){var p=this,q=p.getContainer();p.removed=1;p.hide();p.execCallback("remove_instance_callback",p);p.onRemove.dispatch(p);p.onExecCommand.listeners=[];m.remove(p);n.remove(q)},destroy:function(q){var p=this;if(p.destroyed){return}if(!q){m.removeUnload(p.destroy);tinyMCE.onBeforeUnload.remove(p._beforeUnload);if(p.theme&&p.theme.destroy){p.theme.destroy()}p.controlManager.destroy();p.selection.destroy();p.dom.destroy();if(!p.settings.content_editable){j.clear(p.getWin());j.clear(p.getDoc())}j.clear(p.getBody());j.clear(p.formElement)}if(p.formElement){p.formElement.submit=p.formElement._mceOldSubmit;p.formElement._mceOldSubmit=null}p.contentAreaContainer=p.formElement=p.container=p.settings.content_element=p.bodyElement=p.contentDocument=p.contentWindow=null;if(p.selection){p.selection=p.selection.win=p.selection.dom=p.selection.dom.doc=null}p.destroyed=1},_addEvents:function(){var B=this,r,C=B.settings,q=B.dom,x={mouseup:"onMouseUp",mousedown:"onMouseDown",click:"onClick",keyup:"onKeyUp",keydown:"onKeyDown",keypress:"onKeyPress",submit:"onSubmit",reset:"onReset",contextmenu:"onContextMenu",dblclick:"onDblClick",paste:"onPaste"};function p(t,D){var s=t.type;if(B.removed){return}if(B.onEvent.dispatch(B,t,D)!==false){B[x[t.fakeType||t.type]].dispatch(B,t,D)}}i(x,function(t,s){switch(s){case"contextmenu":q.bind(B.getDoc(),s,p);break;case"paste":q.bind(B.getBody(),s,function(D){p(D)});break;case"submit":case"reset":q.bind(B.getElement().form||n.getParent(B.id,"form"),s,p);break;default:q.bind(C.content_editable?B.getBody():B.getDoc(),s,p)}});q.bind(C.content_editable?B.getBody():(a?B.getDoc():B.getWin()),"focus",function(s){B.focus(true)});if(m.isGecko){q.bind(B.getDoc(),"DOMNodeInserted",function(t){var s;t=t.target;if(t.nodeType===1&&t.nodeName==="IMG"&&(s=t.getAttribute("data-mce-src"))){t.src=B.documentBaseURI.toAbsolute(s)}})}if(a){function u(){var E=this,G=E.getDoc(),F=E.settings;if(a&&!F.readonly){E._refreshContentEditable();try{G.execCommand("styleWithCSS",0,false)}catch(D){if(!E._isHidden()){try{G.execCommand("useCSS",0,true)}catch(D){}}}if(!F.table_inline_editing){try{G.execCommand("enableInlineTableEditing",false,false)}catch(D){}}if(!F.object_resizing){try{G.execCommand("enableObjectResizing",false,false)}catch(D){}}}}B.onBeforeExecCommand.add(u);B.onMouseDown.add(u)}B.onMouseUp.add(B.nodeChanged);B.onKeyUp.add(function(s,t){var D=t.keyCode;if((D>=33&&D<=36)||(D>=37&&D<=40)||D==13||D==45||D==46||D==8||(m.isMac&&(D==91||D==93))||t.ctrlKey){B.nodeChanged()}});B.onKeyDown.add(function(t,D){if(D.keyCode!=8){return}var F=t.selection.getRng().startContainer;var E=t.selection.getRng().startOffset;while(F&&F.nodeType&&F.nodeType!=1&&F.parentNode){F=F.parentNode}if(F&&F.parentNode&&F.parentNode.tagName==="BLOCKQUOTE"&&F.parentNode.firstChild==F&&E==0){t.formatter.toggle("blockquote",null,F.parentNode);var s=t.selection.getRng();s.setStart(F,0);s.setEnd(F,0);t.selection.setRng(s);t.selection.collapse(false)}});B.onReset.add(function(){B.setContent(B.startContent,{format:"raw"})});if(C.custom_shortcuts){if(C.custom_undo_redo_keyboard_shortcuts){B.addShortcut("ctrl+z",B.getLang("undo_desc"),"Undo");B.addShortcut("ctrl+y",B.getLang("redo_desc"),"Redo")}B.addShortcut("ctrl+b",B.getLang("bold_desc"),"Bold");B.addShortcut("ctrl+i",B.getLang("italic_desc"),"Italic");B.addShortcut("ctrl+u",B.getLang("underline_desc"),"Underline");for(r=1;r<=6;r++){B.addShortcut("ctrl+"+r,"",["FormatBlock",false,"h"+r])}B.addShortcut("ctrl+7","",["FormatBlock",false,"p"]);B.addShortcut("ctrl+8","",["FormatBlock",false,"div"]);B.addShortcut("ctrl+9","",["FormatBlock",false,"address"]);function v(t){var s=null;if(!t.altKey&&!t.ctrlKey&&!t.metaKey){return s}i(B.shortcuts,function(D){if(m.isMac&&D.ctrl!=t.metaKey){return}else{if(!m.isMac&&D.ctrl!=t.ctrlKey){return}}if(D.alt!=t.altKey){return}if(D.shift!=t.shiftKey){return}if(t.keyCode==D.keyCode||(t.charCode&&t.charCode==D.charCode)){s=D;return false}});return s}B.onKeyUp.add(function(s,t){var D=v(t);if(D){return j.cancel(t)}});B.onKeyPress.add(function(s,t){var D=v(t);if(D){return j.cancel(t)}});B.onKeyDown.add(function(s,t){var D=v(t);if(D){D.func.call(D.scope);return j.cancel(t)}})}if(m.isIE){q.bind(B.getDoc(),"controlselect",function(D){var t=B.resizeInfo,s;D=D.target;if(D.nodeName!=="IMG"){return}if(t){q.unbind(t.node,t.ev,t.cb)}if(!q.hasClass(D,"mceItemNoResize")){ev="resizeend";s=q.bind(D,ev,function(F){var E;F=F.target;if(E=q.getStyle(F,"width")){q.setAttrib(F,"width",E.replace(/[^0-9%]+/g,""));q.setStyle(F,"width","")}if(E=q.getStyle(F,"height")){q.setAttrib(F,"height",E.replace(/[^0-9%]+/g,""));q.setStyle(F,"height","")}})}else{ev="resizestart";s=q.bind(D,"resizestart",j.cancel,j)}t=B.resizeInfo={node:D,ev:ev,cb:s}})}if(m.isOpera){B.onClick.add(function(s,t){j.prevent(t)})}if(C.custom_undo_redo){function y(){B.undoManager.typing=false;B.undoManager.add()}q.bind(B.getDoc(),"focusout",function(s){if(!B.removed&&B.undoManager.typing){y()}});B.dom.bind(B.dom.getRoot(),"dragend",function(s){y()});B.onKeyUp.add(function(s,D){var t=D.keyCode;if((t>=33&&t<=36)||(t>=37&&t<=40)||t==13||t==45||D.ctrlKey){y()}});B.onKeyDown.add(function(s,E){var D=E.keyCode,t;if(D==8){t=B.getDoc().selection;if(t&&t.createRange&&t.createRange().item){B.undoManager.beforeChange();s.dom.remove(t.createRange().item(0));y();return j.cancel(E)}}if((D>=33&&D<=36)||(D>=37&&D<=40)||D==13||D==45){if(m.isIE&&D==13){B.undoManager.beforeChange()}if(B.undoManager.typing){y()}return}if((D<16||D>20)&&D!=224&&D!=91&&!B.undoManager.typing){B.undoManager.beforeChange();B.undoManager.typing=true;B.undoManager.add()}});B.onMouseDown.add(function(){if(B.undoManager.typing){y()}})}if(m.isGecko){function A(){var s=B.dom.getAttribs(B.selection.getStart().cloneNode(false));return function(){var t=B.selection.getStart();if(t!==B.getBody()){B.dom.setAttrib(t,"style",null);i(s,function(D){t.setAttributeNode(D.cloneNode(true))})}}}function z(){var t=B.selection;return !t.isCollapsed()&&t.getStart()!=t.getEnd()}B.onKeyPress.add(function(s,D){var t;if((D.keyCode==8||D.keyCode==46)&&z()){t=A();B.getDoc().execCommand("delete",false,null);t();return j.cancel(D)}});B.dom.bind(B.getDoc(),"cut",function(t){var s;if(z()){s=A();B.onKeyUp.addToTop(j.cancel,j);setTimeout(function(){s();B.onKeyUp.remove(j.cancel,j)},0)}})}},_refreshContentEditable:function(){var q=this,p,r;if(q._isHidden()){p=q.getBody();r=p.parentNode;r.removeChild(p);r.appendChild(p);p.focus()}},_isHidden:function(){var p;if(!a){return 0}p=this.selection.getSel();return(!p||!p.rangeCount||p.rangeCount==0)}})})(tinymce);(function(c){var d=c.each,e,a=true,b=false;c.EditorCommands=function(n){var m=n.dom,p=n.selection,j={state:{},exec:{},value:{}},k=n.settings,q=n.formatter,o;function r(z,y,x){var v;z=z.toLowerCase();if(v=j.exec[z]){v(z,y,x);return a}return b}function l(x){var v;x=x.toLowerCase();if(v=j.state[x]){return v(x)}return -1}function h(x){var v;x=x.toLowerCase();if(v=j.value[x]){return v(x)}return b}function u(v,x){x=x||"exec";d(v,function(z,y){d(y.toLowerCase().split(","),function(A){j[x][A]=z})})}c.extend(this,{execCommand:r,queryCommandState:l,queryCommandValue:h,addCommands:u});function f(y,x,v){if(x===e){x=b}if(v===e){v=null}return n.getDoc().execCommand(y,x,v)}function t(v){return q.match(v)}function s(v,x){q.toggle(v,x?{value:x}:e)}function i(v){o=p.getBookmark(v)}function g(){p.moveToBookmark(o)}u({"mceResetDesignMode,mceBeginUndoLevel":function(){},"mceEndUndoLevel,mceAddUndoLevel":function(){n.undoManager.add()},"Cut,Copy,Paste":function(z){var y=n.getDoc(),v;try{f(z)}catch(x){v=a}if(v||!y.queryCommandSupported(z)){if(c.isGecko){n.windowManager.confirm(n.getLang("clipboard_msg"),function(A){if(A){open("http://www.mozilla.org/editor/midasdemo/securityprefs.html","_blank")}})}else{n.windowManager.alert(n.getLang("clipboard_no_support"))}}},unlink:function(v){if(p.isCollapsed()){p.select(p.getNode())}f(v);p.collapse(b)},"JustifyLeft,JustifyCenter,JustifyRight,JustifyFull":function(v){var x=v.substring(7);d("left,center,right,full".split(","),function(y){if(x!=y){q.remove("align"+y)}});s("align"+x);r("mceRepaint")},"InsertUnorderedList,InsertOrderedList":function(y){var v,x;f(y);v=m.getParent(p.getNode(),"ol,ul");if(v){x=v.parentNode;if(/^(H[1-6]|P|ADDRESS|PRE)$/.test(x.nodeName)){i();m.split(x,v);g()}}},"Bold,Italic,Underline,Strikethrough,Superscript,Subscript":function(v){s(v)},"ForeColor,HiliteColor,FontName":function(y,x,v){s(y,v)},FontSize:function(z,y,x){var v,A;if(x>=1&&x<=7){A=c.explode(k.font_size_style_values);v=c.explode(k.font_size_classes);if(v){x=v[x-1]||x}else{x=A[x-1]||x}}s(z,x)},RemoveFormat:function(v){q.remove(v)},mceBlockQuote:function(v){s("blockquote")},FormatBlock:function(y,x,v){return s(v||"p")},mceCleanup:function(){var v=p.getBookmark();n.setContent(n.getContent({cleanup:a}),{cleanup:a});p.moveToBookmark(v)},mceRemoveNode:function(z,y,x){var v=x||p.getNode();if(v!=n.getBody()){i();n.dom.remove(v,a);g()}},mceSelectNodeDepth:function(z,y,x){var v=0;m.getParent(p.getNode(),function(A){if(A.nodeType==1&&v++==x){p.select(A);return b}},n.getBody())},mceSelectNode:function(y,x,v){p.select(v)},mceInsertContent:function(B,I,K){var y,J,E,z,F,G,D,C,L,x,A,M,v,H;y=n.parser;J=new c.html.Serializer({},n.schema);v='<span id="mce_marker" data-mce-type="bookmark">\uFEFF</span>';G={content:K,format:"html"};p.onBeforeSetContent.dispatch(p,G);K=G.content;if(K.indexOf("{$caret}")==-1){K+="{$caret}"}K=K.replace(/\{\$caret\}/,v);if(!p.isCollapsed()){n.getDoc().execCommand("Delete",false,null)}E=p.getNode();G={context:E.nodeName.toLowerCase()};F=y.parse(K,G);A=F.lastChild;if(A.attr("id")=="mce_marker"){D=A;for(A=A.prev;A;A=A.walk(true)){if(A.type==3||!m.isBlock(A.name)){A.parent.insert(D,A,A.name==="br");break}}}if(!G.invalid){K=J.serialize(F);A=E.firstChild;M=E.lastChild;if(!A||(A===M&&A.nodeName==="BR")){m.setHTML(E,K)}else{p.setContent(K)}}else{p.setContent(v);E=n.selection.getNode();z=n.getBody();if(E.nodeType==9){E=A=z}else{A=E}while(A!==z){E=A;A=A.parentNode}K=E==z?z.innerHTML:m.getOuterHTML(E);K=J.serialize(y.parse(K.replace(/<span (id="mce_marker"|id=mce_marker).+?<\/span>/i,function(){return J.serialize(F)})));if(E==z){m.setHTML(z,K)}else{m.setOuterHTML(E,K)}}D=m.get("mce_marker");C=m.getRect(D);L=m.getViewPort(n.getWin());if((C.y+C.h>L.y+L.h||C.y<L.y)||(C.x>L.x+L.w||C.x<L.x)){H=c.isIE?n.getDoc().documentElement:n.getBody();H.scrollLeft=C.x;H.scrollTop=C.y-L.h+25}x=m.createRng();A=D.previousSibling;if(A&&A.nodeType==3){x.setStart(A,A.nodeValue.length)}else{x.setStartBefore(D);x.setEndBefore(D)}m.remove(D);p.setRng(x);p.onSetContent.dispatch(p,G);n.addVisual()},mceInsertRawHTML:function(y,x,v){p.setContent("tiny_mce_marker");n.setContent(n.getContent().replace(/tiny_mce_marker/g,function(){return v}))},mceSetContent:function(y,x,v){n.setContent(v)},"Indent,Outdent":function(z){var x,v,y;x=k.indentation;v=/[a-z%]+$/i.exec(x);x=parseInt(x);if(!l("InsertUnorderedList")&&!l("InsertOrderedList")){d(p.getSelectedBlocks(),function(A){if(z=="outdent"){y=Math.max(0,parseInt(A.style.paddingLeft||0)-x);m.setStyle(A,"paddingLeft",y?y+v:"")}else{m.setStyle(A,"paddingLeft",(parseInt(A.style.paddingLeft||0)+x)+v)}})}else{f(z)}},mceRepaint:function(){var x;if(c.isGecko){try{i(a);if(p.getSel()){p.getSel().selectAllChildren(n.getBody())}p.collapse(a);g()}catch(v){}}},mceToggleFormat:function(y,x,v){q.toggle(v)},InsertHorizontalRule:function(){n.execCommand("mceInsertContent",false,"<hr />")},mceToggleVisualAid:function(){n.hasVisual=!n.hasVisual;n.addVisual()},mceReplaceContent:function(y,x,v){n.execCommand("mceInsertContent",false,v.replace(/\{\$selection\}/g,p.getContent({format:"text"})))},mceInsertLink:function(z,y,x){var v;if(typeof(x)=="string"){x={href:x}}v=m.getParent(p.getNode(),"a");x.href=x.href.replace(" ","%20");if(!v||!x.href){q.remove("link")}if(x.href){q.apply("link",x,v)}},selectAll:function(){var x=m.getRoot(),v=m.createRng();v.setStart(x,0);v.setEnd(x,x.childNodes.length);n.selection.setRng(v)}});u({"JustifyLeft,JustifyCenter,JustifyRight,JustifyFull":function(v){return t("align"+v.substring(7))},"Bold,Italic,Underline,Strikethrough,Superscript,Subscript":function(v){return t(v)},mceBlockQuote:function(){return t("blockquote")},Outdent:function(){var v;if(k.inline_styles){if((v=m.getParent(p.getStart(),m.isBlock))&&parseInt(v.style.paddingLeft)>0){return a}if((v=m.getParent(p.getEnd(),m.isBlock))&&parseInt(v.style.paddingLeft)>0){return a}}return l("InsertUnorderedList")||l("InsertOrderedList")||(!k.inline_styles&&!!m.getParent(p.getNode(),"BLOCKQUOTE"))},"InsertUnorderedList,InsertOrderedList":function(v){return m.getParent(p.getNode(),v=="insertunorderedlist"?"UL":"OL")}},"state");u({"FontSize,FontName":function(y){var x=0,v;if(v=m.getParent(p.getNode(),"span")){if(y=="fontsize"){x=v.style.fontSize}else{x=v.style.fontFamily.replace(/, /g,",").replace(/[\'\"]/g,"").toLowerCase()}}return x}},"value");if(k.custom_undo_redo){u({Undo:function(){n.undoManager.undo()},Redo:function(){n.undoManager.redo()}})}}})(tinymce);(function(b){var a=b.util.Dispatcher;b.UndoManager=function(f){var d,e=0,h=[],c;function g(){return b.trim(f.getContent({format:"raw",no_events:1}))}return d={typing:false,onAdd:new a(d),onUndo:new a(d),onRedo:new a(d),beforeChange:function(){c=f.selection.getBookmark(2,true)},add:function(m){var j,k=f.settings,l;m=m||{};m.content=g();l=h[e];if(l&&l.content==m.content){return null}if(h[e]){h[e].beforeBookmark=c}if(k.custom_undo_redo_levels){if(h.length>k.custom_undo_redo_levels){for(j=0;j<h.length-1;j++){h[j]=h[j+1]}h.length--;e=h.length}}m.bookmark=f.selection.getBookmark(2,true);if(e<h.length-1){h.length=e+1}h.push(m);e=h.length-1;d.onAdd.dispatch(d,m);f.isNotDirty=0;return m},undo:function(){var k,j;if(d.typing){d.add();d.typing=false}if(e>0){k=h[--e];f.setContent(k.content,{format:"raw"});f.selection.moveToBookmark(k.beforeBookmark);d.onUndo.dispatch(d,k)}return k},redo:function(){var i;if(e<h.length-1){i=h[++e];f.setContent(i.content,{format:"raw"});f.selection.moveToBookmark(i.bookmark);d.onRedo.dispatch(d,i)}return i},clear:function(){h=[];e=0;d.typing=false},hasUndo:function(){return e>0||this.typing},hasRedo:function(){return e<h.length-1&&!this.typing}}}})(tinymce);(function(l){var j=l.dom.Event,c=l.isIE,a=l.isGecko,b=l.isOpera,i=l.each,h=l.extend,d=true,g=false;function k(o){var p,n,m;do{if(/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(o.nodeName)){if(p){n=o.cloneNode(false);n.appendChild(p);p=n}else{p=m=o.cloneNode(false)}p.removeAttribute("id")}}while(o=o.parentNode);if(p){return{wrapper:p,inner:m}}}function f(n,o){var m=o.ownerDocument.createRange();m.setStart(n.endContainer,n.endOffset);m.setEndAfter(o);return m.cloneContents().textContent.length==0}function e(o,q,m){var n,p;if(q.isEmpty(m)){n=q.getParent(m,"ul,ol");if(!q.getParent(n.parentNode,"ul,ol")){q.split(n,m);p=q.create("p",0,'<br data-mce-bogus="1" />');q.replace(p,m);o.select(p,1)}return g}return d}l.create("tinymce.ForceBlocks",{ForceBlocks:function(m){var n=this,o=m.settings,p;n.editor=m;n.dom=m.dom;p=(o.forced_root_block||"p").toLowerCase();o.element=p.toUpperCase();m.onPreInit.add(n.setup,n)},setup:function(){var n=this,m=n.editor,p=m.settings,u=m.dom,o=m.selection,q=m.schema.getBlockElements();if(p.forced_root_block){function v(){var y=o.getStart(),t=m.getBody(),s,z,D,F,E,x,A,B=-16777215;if(!y||y.nodeType!==1){return}while(y!=t){if(q[y.nodeName]){return}y=y.parentNode}s=o.getRng();if(s.setStart){z=s.startContainer;D=s.startOffset;F=s.endContainer;E=s.endOffset}else{if(s.item){s=m.getDoc().body.createTextRange();s.moveToElementText(s.item(0))}tmpRng=s.duplicate();tmpRng.collapse(true);D=tmpRng.move("character",B)*-1;if(!tmpRng.collapsed){tmpRng=s.duplicate();tmpRng.collapse(false);E=(tmpRng.move("character",B)*-1)-D}}for(y=t.firstChild;y;y){if(y.nodeType===3||(y.nodeType==1&&!q[y.nodeName])){if(!x){x=u.create(p.forced_root_block);y.parentNode.insertBefore(x,y)}A=y;y=y.nextSibling;x.appendChild(A)}else{x=null;y=y.nextSibling}}if(s.setStart){s.setStart(z,D);s.setEnd(F,E);o.setRng(s)}else{try{s=m.getDoc().body.createTextRange();s.moveToElementText(t);s.collapse(true);s.moveStart("character",D);if(E>0){s.moveEnd("character",E)}s.select()}catch(C){}}m.nodeChanged()}m.onKeyUp.add(v);m.onClick.add(v)}if(p.force_br_newlines){if(c){m.onKeyPress.add(function(s,t){var x;if(t.keyCode==13&&o.getNode().nodeName!="LI"){o.setContent('<br id="__" /> ',{format:"raw"});x=u.get("__");x.removeAttribute("id");o.select(x);o.collapse();return j.cancel(t)}})}}if(p.force_p_newlines){if(!c){m.onKeyPress.add(function(s,t){if(t.keyCode==13&&!t.shiftKey&&!n.insertPara(t)){j.cancel(t)}})}else{l.addUnload(function(){n._previousFormats=0});m.onKeyPress.add(function(s,t){n._previousFormats=0;if(t.keyCode==13&&!t.shiftKey&&s.selection.isCollapsed()&&p.keep_styles){n._previousFormats=k(s.selection.getStart())}});m.onKeyUp.add(function(t,y){if(y.keyCode==13&&!y.shiftKey){var x=t.selection.getStart(),s=n._previousFormats;if(!x.hasChildNodes()&&s){x=u.getParent(x,u.isBlock);if(x&&x.nodeName!="LI"){x.innerHTML="";if(n._previousFormats){x.appendChild(s.wrapper);s.inner.innerHTML="\uFEFF"}else{x.innerHTML="\uFEFF"}o.select(x,1);o.collapse(true);t.getDoc().execCommand("Delete",false,null);n._previousFormats=0}}}})}if(a){m.onKeyDown.add(function(s,t){if((t.keyCode==8||t.keyCode==46)&&!t.shiftKey){n.backspaceDelete(t,t.keyCode==8)}})}}if(l.isWebKit){function r(t){var s=o.getRng(),x,A=u.create("div",null," "),z,y=u.getViewPort(t.getWin()).h;s.insertNode(x=u.create("br"));s.setStartAfter(x);s.setEndAfter(x);o.setRng(s);if(o.getSel().focusNode==x.previousSibling){o.select(u.insertAfter(u.doc.createTextNode("\u00a0"),x));o.collapse(d)}u.insertAfter(A,x);z=u.getPos(A).y;u.remove(A);if(z>y){t.getWin().scrollTo(0,z)}}m.onKeyPress.add(function(s,t){if(t.keyCode==13&&(t.shiftKey||(p.force_br_newlines&&!u.getParent(o.getNode(),"h1,h2,h3,h4,h5,h6,ol,ul")))){r(s);j.cancel(t)}})}if(c){if(p.element!="P"){m.onKeyPress.add(function(s,t){n.lastElm=o.getNode().nodeName});m.onKeyUp.add(function(t,x){var z,y=o.getNode(),s=t.getBody();if(s.childNodes.length===1&&y.nodeName=="P"){y=u.rename(y,p.element);o.select(y);o.collapse();t.nodeChanged()}else{if(x.keyCode==13&&!x.shiftKey&&n.lastElm!="P"){z=u.getParent(y,"p");if(z){u.rename(z,p.element);t.nodeChanged()}}}})}}},getParentBlock:function(o){var m=this.dom;return m.getParent(o,m.isBlock)},insertPara:function(Q){var E=this,v=E.editor,M=v.dom,R=v.getDoc(),V=v.settings,F=v.selection.getSel(),G=F.getRangeAt(0),U=R.body;var J,K,H,O,N,q,o,u,z,m,C,T,p,x,I,L=M.getViewPort(v.getWin()),B,D,A;v.undoManager.beforeChange();J=R.createRange();J.setStart(F.anchorNode,F.anchorOffset);J.collapse(d);K=R.createRange();K.setStart(F.focusNode,F.focusOffset);K.collapse(d);H=J.compareBoundaryPoints(J.START_TO_END,K)<0;O=H?F.anchorNode:F.focusNode;N=H?F.anchorOffset:F.focusOffset;q=H?F.focusNode:F.anchorNode;o=H?F.focusOffset:F.anchorOffset;if(O===q&&/^(TD|TH)$/.test(O.nodeName)){if(O.firstChild.nodeName=="BR"){M.remove(O.firstChild)}if(O.childNodes.length==0){v.dom.add(O,V.element,null,"<br />");T=v.dom.add(O,V.element,null,"<br />")}else{I=O.innerHTML;O.innerHTML="";v.dom.add(O,V.element,null,I);T=v.dom.add(O,V.element,null,"<br />")}G=R.createRange();G.selectNodeContents(T);G.collapse(1);v.selection.setRng(G);return g}if(O==U&&q==U&&U.firstChild&&v.dom.isBlock(U.firstChild)){O=q=O.firstChild;N=o=0;J=R.createRange();J.setStart(O,0);K=R.createRange();K.setStart(q,0)}if(!R.body.hasChildNodes()){R.body.appendChild(M.create("br"))}O=O.nodeName=="HTML"?R.body:O;O=O.nodeName=="BODY"?O.firstChild:O;q=q.nodeName=="HTML"?R.body:q;q=q.nodeName=="BODY"?q.firstChild:q;u=E.getParentBlock(O);z=E.getParentBlock(q);m=u?u.nodeName:V.element;if(I=E.dom.getParent(u,"li,pre")){if(I.nodeName=="LI"){return e(v.selection,E.dom,I)}return d}if(u&&(u.nodeName=="CAPTION"||/absolute|relative|fixed/gi.test(M.getStyle(u,"position",1)))){m=V.element;u=null}if(z&&(z.nodeName=="CAPTION"||/absolute|relative|fixed/gi.test(M.getStyle(u,"position",1)))){m=V.element;z=null}if(/(TD|TABLE|TH|CAPTION)/.test(m)||(u&&m=="DIV"&&/left|right/gi.test(M.getStyle(u,"float",1)))){m=V.element;u=z=null}C=(u&&u.nodeName==m)?u.cloneNode(0):v.dom.create(m);T=(z&&z.nodeName==m)?z.cloneNode(0):v.dom.create(m);T.removeAttribute("id");if(/^(H[1-6])$/.test(m)&&f(G,u)){T=v.dom.create(V.element)}I=p=O;do{if(I==U||I.nodeType==9||E.dom.isBlock(I)||/(TD|TABLE|TH|CAPTION)/.test(I.nodeName)){break}p=I}while((I=I.previousSibling?I.previousSibling:I.parentNode));I=x=q;do{if(I==U||I.nodeType==9||E.dom.isBlock(I)||/(TD|TABLE|TH|CAPTION)/.test(I.nodeName)){break}x=I}while((I=I.nextSibling?I.nextSibling:I.parentNode));if(p.nodeName==m){J.setStart(p,0)}else{J.setStartBefore(p)}J.setEnd(O,N);C.appendChild(J.cloneContents()||R.createTextNode(""));try{K.setEndAfter(x)}catch(P){}K.setStart(q,o);T.appendChild(K.cloneContents()||R.createTextNode(""));G=R.createRange();if(!p.previousSibling&&p.parentNode.nodeName==m){G.setStartBefore(p.parentNode)}else{if(J.startContainer.nodeName==m&&J.startOffset==0){G.setStartBefore(J.startContainer)}else{G.setStart(J.startContainer,J.startOffset)}}if(!x.nextSibling&&x.parentNode.nodeName==m){G.setEndAfter(x.parentNode)}else{G.setEnd(K.endContainer,K.endOffset)}G.deleteContents();if(b){v.getWin().scrollTo(0,L.y)}if(C.firstChild&&C.firstChild.nodeName==m){C.innerHTML=C.firstChild.innerHTML}if(T.firstChild&&T.firstChild.nodeName==m){T.innerHTML=T.firstChild.innerHTML}function S(y,s){var r=[],X,W,t;y.innerHTML="";if(V.keep_styles){W=s;do{if(/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(W.nodeName)){X=W.cloneNode(g);M.setAttrib(X,"id","");r.push(X)}}while(W=W.parentNode)}if(r.length>0){for(t=r.length-1,X=y;t>=0;t--){X=X.appendChild(r[t])}r[0].innerHTML=b?"\u00a0":"<br />";return r[0]}else{y.innerHTML=b?"\u00a0":"<br />"}}if(M.isEmpty(C)){S(C,O)}if(M.isEmpty(T)){A=S(T,q)}if(b&&parseFloat(opera.version())<9.5){G.insertNode(C);G.insertNode(T)}else{G.insertNode(T);G.insertNode(C)}T.normalize();C.normalize();v.selection.select(T,true);v.selection.collapse(true);B=v.dom.getPos(T).y;if(B<L.y||B+25>L.y+L.h){v.getWin().scrollTo(0,B<L.y?B:B-L.h+25)}v.undoManager.add();return g},backspaceDelete:function(u,B){var C=this,s=C.editor,y=s.getBody(),q=s.dom,p,v=s.selection,o=v.getRng(),x=o.startContainer,p,z,A,m;if(!B&&o.collapsed&&x.nodeType==1&&o.startOffset==x.childNodes.length){m=new l.dom.TreeWalker(x.lastChild,x);for(p=x.lastChild;p;p=m.prev()){if(p.nodeType==3){o.setStart(p,p.nodeValue.length);o.collapse(true);v.setRng(o);return}}}if(x&&s.dom.isBlock(x)&&!/^(TD|TH)$/.test(x.nodeName)&&B){if(x.childNodes.length==0||(x.childNodes.length==1&&x.firstChild.nodeName=="BR")){p=x;while((p=p.previousSibling)&&!s.dom.isBlock(p)){}if(p){if(x!=y.firstChild){z=s.dom.doc.createTreeWalker(p,NodeFilter.SHOW_TEXT,null,g);while(A=z.nextNode()){p=A}o=s.getDoc().createRange();o.setStart(p,p.nodeValue?p.nodeValue.length:0);o.setEnd(p,p.nodeValue?p.nodeValue.length:0);v.setRng(o);s.dom.remove(x)}return j.cancel(u)}}}}})})(tinymce);(function(c){var b=c.DOM,a=c.dom.Event,d=c.each,e=c.extend;c.create("tinymce.ControlManager",{ControlManager:function(f,j){var h=this,g;j=j||{};h.editor=f;h.controls={};h.onAdd=new c.util.Dispatcher(h);h.onPostRender=new c.util.Dispatcher(h);h.prefix=j.prefix||f.id+"_";h._cls={};h.onPostRender.add(function(){d(h.controls,function(i){i.postRender()})})},get:function(f){return this.controls[this.prefix+f]||this.controls[f]},setActive:function(h,f){var g=null;if(g=this.get(h)){g.setActive(f)}return g},setDisabled:function(h,f){var g=null;if(g=this.get(h)){g.setDisabled(f)}return g},add:function(g){var f=this;if(g){f.controls[g.id]=g;f.onAdd.dispatch(g,f)}return g},createControl:function(i){var h,g=this,f=g.editor;d(f.plugins,function(j){if(j.createControl){h=j.createControl(i,g);if(h){return false}}});switch(i){case"|":case"separator":return g.createSeparator()}if(!h&&f.buttons&&(h=f.buttons[i])){return g.createButton(i,h)}return g.add(h)},createDropMenu:function(f,n,h){var m=this,i=m.editor,j,g,k,l;n=e({"class":"mceDropDown",constrain:i.settings.constrain_menus},n);n["class"]=n["class"]+" "+i.getParam("skin")+"Skin";if(k=i.getParam("skin_variant")){n["class"]+=" "+i.getParam("skin")+"Skin"+k.substring(0,1).toUpperCase()+k.substring(1)}f=m.prefix+f;l=h||m._cls.dropmenu||c.ui.DropMenu;j=m.controls[f]=new l(f,n);j.onAddItem.add(function(r,q){var p=q.settings;p.title=i.getLang(p.title,p.title);if(!p.onclick){p.onclick=function(o){if(p.cmd){i.execCommand(p.cmd,p.ui||false,p.value)}}}});i.onRemove.add(function(){j.destroy()});if(c.isIE){j.onShowMenu.add(function(){i.focus();g=i.selection.getBookmark(1)});j.onHideMenu.add(function(){if(g){i.selection.moveToBookmark(g);g=0}})}return m.add(j)},createListBox:function(f,n,h){var l=this,j=l.editor,i,k,m;if(l.get(f)){return null}n.title=j.translate(n.title);n.scope=n.scope||j;if(!n.onselect){n.onselect=function(o){j.execCommand(n.cmd,n.ui||false,o||n.value)}}n=e({title:n.title,"class":"mce_"+f,scope:n.scope,control_manager:l},n);f=l.prefix+f;function g(o){return o.settings.use_accessible_selects&&!c.isGecko}if(j.settings.use_native_selects||g(j)){k=new c.ui.NativeListBox(f,n)}else{m=h||l._cls.listbox||c.ui.ListBox;k=new m(f,n,j)}l.controls[f]=k;if(c.isWebKit){k.onPostRender.add(function(p,o){a.add(o,"mousedown",function(){j.bookmark=j.selection.getBookmark(1)});a.add(o,"focus",function(){j.selection.moveToBookmark(j.bookmark);j.bookmark=null})})}if(k.hideMenu){j.onMouseDown.add(k.hideMenu,k)}return l.add(k)},createButton:function(m,i,l){var h=this,g=h.editor,j,k,f;if(h.get(m)){return null}i.title=g.translate(i.title);i.label=g.translate(i.label);i.scope=i.scope||g;if(!i.onclick&&!i.menu_button){i.onclick=function(){g.execCommand(i.cmd,i.ui||false,i.value)}}i=e({title:i.title,"class":"mce_"+m,unavailable_prefix:g.getLang("unavailable",""),scope:i.scope,control_manager:h},i);m=h.prefix+m;if(i.menu_button){f=l||h._cls.menubutton||c.ui.MenuButton;k=new f(m,i,g);g.onMouseDown.add(k.hideMenu,k)}else{f=h._cls.button||c.ui.Button;k=new f(m,i,g)}return h.add(k)},createMenuButton:function(h,f,g){f=f||{};f.menu_button=1;return this.createButton(h,f,g)},createSplitButton:function(m,i,l){var h=this,g=h.editor,j,k,f;if(h.get(m)){return null}i.title=g.translate(i.title);i.scope=i.scope||g;if(!i.onclick){i.onclick=function(n){g.execCommand(i.cmd,i.ui||false,n||i.value)}}if(!i.onselect){i.onselect=function(n){g.execCommand(i.cmd,i.ui||false,n||i.value)}}i=e({title:i.title,"class":"mce_"+m,scope:i.scope,control_manager:h},i);m=h.prefix+m;f=l||h._cls.splitbutton||c.ui.SplitButton;k=h.add(new f(m,i,g));g.onMouseDown.add(k.hideMenu,k);return k},createColorSplitButton:function(f,n,h){var l=this,j=l.editor,i,k,m,g;if(l.get(f)){return null}n.title=j.translate(n.title);n.scope=n.scope||j;if(!n.onclick){n.onclick=function(o){if(c.isIE){g=j.selection.getBookmark(1)}j.execCommand(n.cmd,n.ui||false,o||n.value)}}if(!n.onselect){n.onselect=function(o){j.execCommand(n.cmd,n.ui||false,o||n.value)}}n=e({title:n.title,"class":"mce_"+f,menu_class:j.getParam("skin")+"Skin",scope:n.scope,more_colors_title:j.getLang("more_colors")},n);f=l.prefix+f;m=h||l._cls.colorsplitbutton||c.ui.ColorSplitButton;k=new m(f,n,j);j.onMouseDown.add(k.hideMenu,k);j.onRemove.add(function(){k.destroy()});if(c.isIE){k.onShowMenu.add(function(){j.focus();g=j.selection.getBookmark(1)});k.onHideMenu.add(function(){if(g){j.selection.moveToBookmark(g);g=0}})}return l.add(k)},createToolbar:function(k,h,j){var i,g=this,f;k=g.prefix+k;f=j||g._cls.toolbar||c.ui.Toolbar;i=new f(k,h,g.editor);if(g.get(k)){return null}return g.add(i)},createToolbarGroup:function(k,h,j){var i,g=this,f;k=g.prefix+k;f=j||this._cls.toolbarGroup||c.ui.ToolbarGroup;i=new f(k,h,g.editor);if(g.get(k)){return null}return g.add(i)},createSeparator:function(g){var f=g||this._cls.separator||c.ui.Separator;return new f()},setControlType:function(g,f){return this._cls[g.toLowerCase()]=f},destroy:function(){d(this.controls,function(f){f.destroy()});this.controls=null}})})(tinymce);(function(d){var a=d.util.Dispatcher,e=d.each,c=d.isIE,b=d.isOpera;d.create("tinymce.WindowManager",{WindowManager:function(f){var g=this;g.editor=f;g.onOpen=new a(g);g.onClose=new a(g);g.params={};g.features={}},open:function(z,h){var v=this,k="",n,m,i=v.editor.settings.dialog_type=="modal",q,o,j,g=d.DOM.getViewPort(),r;z=z||{};h=h||{};o=b?g.w:screen.width;j=b?g.h:screen.height;z.name=z.name||"mc_"+new Date().getTime();z.width=parseInt(z.width||320);z.height=parseInt(z.height||240);z.resizable=true;z.left=z.left||parseInt(o/2)-(z.width/2);z.top=z.top||parseInt(j/2)-(z.height/2);h.inline=false;h.mce_width=z.width;h.mce_height=z.height;h.mce_auto_focus=z.auto_focus;if(i){if(c){z.center=true;z.help=false;z.dialogWidth=z.width+"px";z.dialogHeight=z.height+"px";z.scroll=z.scrollbars||false}}e(z,function(p,f){if(d.is(p,"boolean")){p=p?"yes":"no"}if(!/^(name|url)$/.test(f)){if(c&&i){k+=(k?";":"")+f+":"+p}else{k+=(k?",":"")+f+"="+p}}});v.features=z;v.params=h;v.onOpen.dispatch(v,z,h);r=z.url||z.file;r=d._addVer(r);try{if(c&&i){q=1;window.showModalDialog(r,window,k)}else{q=window.open(r,z.name,k)}}catch(l){}if(!q){alert(v.editor.getLang("popup_blocked"))}},close:function(f){f.close();this.onClose.dispatch(this)},createInstance:function(i,h,g,m,l,k){var j=d.resolve(i);return new j(h,g,m,l,k)},confirm:function(h,f,i,g){g=g||window;f.call(i||this,g.confirm(this._decode(this.editor.getLang(h,h))))},alert:function(h,f,j,g){var i=this;g=g||window;g.alert(i._decode(i.editor.getLang(h,h)));if(f){f.call(j||i)}},resizeBy:function(f,g,h){h.resizeBy(f,g)},_decode:function(f){return d.DOM.decode(f).replace(/\\n/g,"\n")}})}(tinymce));(function(a){a.Formatter=function(U){var M={},O=a.each,c=U.dom,q=U.selection,t=a.dom.TreeWalker,K=new a.dom.RangeUtils(c),d=U.schema.isValidChild,F=c.isBlock,l=U.settings.forced_root_block,s=c.nodeIndex,E="\uFEFF",e=/^(src|href|style)$/,R=false,B=true,p;function z(V){return V instanceof Array}function m(W,V){return c.getParents(W,V,c.getRoot())}function b(V){return V.nodeType===1&&(V.face==="mceinline"||V.style.fontFamily==="mceinline")}function Q(V){return V?M[V]:M}function k(V,W){if(V){if(typeof(V)!=="string"){O(V,function(Y,X){k(X,Y)})}else{W=W.length?W:[W];O(W,function(X){if(X.deep===p){X.deep=!X.selector}if(X.split===p){X.split=!X.selector||X.inline}if(X.remove===p&&X.selector&&!X.inline){X.remove="none"}if(X.selector&&X.inline){X.mixed=true;X.block_expand=true}if(typeof(X.classes)==="string"){X.classes=X.classes.split(/\s+/)}});M[V]=W}}}var i=function(W){var V;U.dom.getParent(W,function(X){V=U.dom.getStyle(X,"text-decoration");return V&&V!=="none"});return V};var I=function(V){var W;if(V.nodeType===1&&V.parentNode&&V.parentNode.nodeType===1){W=i(V.parentNode);if(U.dom.getStyle(V,"color")&&W){U.dom.setStyle(V,"text-decoration",W)}else{if(U.dom.getStyle(V,"textdecoration")===W){U.dom.setStyle(V,"text-decoration",null)}}}};function S(Y,ag,ab){var ac=Q(Y),ah=ac[0],af,W,ae,ad=q.isCollapsed();function Z(al){var ak=al.startContainer,ao=al.startOffset,an,am;if(ak.nodeType==1||ak.nodeValue===""){ak=ak.nodeType==1?ak.childNodes[ao]:ak;if(ak){an=new t(ak,ak.parentNode);for(am=an.current();am;am=an.next()){if(am.nodeType==3&&!f(am)){al.setStart(am,0);break}}}}return al}function V(al,ak){ak=ak||ah;if(al){if(ak.onformat){ak.onformat(al,ak,ag,ab)}O(ak.styles,function(an,am){c.setStyle(al,am,r(an,ag))});O(ak.attributes,function(an,am){c.setAttrib(al,am,r(an,ag))});O(ak.classes,function(am){am=r(am,ag);if(!c.hasClass(al,am)){c.addClass(al,am)}})}}function aa(){function am(at,aq){var ar=new t(aq);for(ab=ar.current();ab;ab=ar.prev()){if(ab.childNodes.length>1||ab==at){return ab}}}var al=U.selection.getRng();var ap=al.startContainer;var ak=al.endContainer;if(ap!=ak&&al.endOffset==0){var ao=am(ap,ak);var an=ao.nodeType==3?ao.length:ao.childNodes.length;al.setEnd(ao,an)}return al}function X(an,at,aq,ap,al){var ak=[],am=-1,ar,av=-1,ao=-1,au;O(an.childNodes,function(ax,aw){if(ax.nodeName==="UL"||ax.nodeName==="OL"){am=aw;ar=ax;return false}});O(an.childNodes,function(ax,aw){if(ax.nodeName==="SPAN"&&c.getAttrib(ax,"data-mce-type")=="bookmark"){if(ax.id==at.id+"_start"){av=aw}else{if(ax.id==at.id+"_end"){ao=aw}}}});if(am<=0||(av<am&&ao>am)){O(a.grep(an.childNodes),al);return 0}else{au=aq.cloneNode(R);O(a.grep(an.childNodes),function(ax,aw){if((av<am&&aw<am)||(av>am&&aw>am)){ak.push(ax);ax.parentNode.removeChild(ax)}});if(av<am){an.insertBefore(au,ar)}else{if(av>am){an.insertBefore(au,ar.nextSibling)}}ap.push(au);O(ak,function(aw){au.appendChild(aw)});return au}}function ai(al,an,ap){var ak=[],ao,am;ao=ah.inline||ah.block;am=c.create(ao);V(am);K.walk(al,function(aq){var ar;function at(au){var ax=au.nodeName.toLowerCase(),aw=au.parentNode.nodeName.toLowerCase(),av;if(g(ax,"br")){ar=0;if(ah.block){c.remove(au)}return}if(ah.wrapper&&x(au,Y,ag)){ar=0;return}if(ah.block&&!ah.wrapper&&G(ax)){au=c.rename(au,ao);V(au);ak.push(au);ar=0;return}if(ah.selector){O(ac,function(ay){if("collapsed" in ay&&ay.collapsed!==ad){return}if(c.is(au,ay.selector)&&!b(au)){V(au,ay);av=true}});if(!ah.inline||av){ar=0;return}}if(d(ao,ax)&&d(aw,ao)&&!(!ap&&au.nodeType===3&&au.nodeValue.length===1&&au.nodeValue.charCodeAt(0)===65279)&&au.id!=="_mce_caret"){if(!ar){ar=am.cloneNode(R);au.parentNode.insertBefore(ar,au);ak.push(ar)}ar.appendChild(au)}else{if(ax=="li"&&an){ar=X(au,an,am,ak,at)}else{ar=0;O(a.grep(au.childNodes),at);ar=0}}}O(aq,at)});if(ah.wrap_links===false){O(ak,function(aq){function ar(aw){var av,au,at;if(aw.nodeName==="A"){au=am.cloneNode(R);ak.push(au);at=a.grep(aw.childNodes);for(av=0;av<at.length;av++){au.appendChild(at[av])}aw.appendChild(au)}O(a.grep(aw.childNodes),ar)}ar(aq)})}O(ak,function(at){var aq;function au(aw){var av=0;O(aw.childNodes,function(ax){if(!f(ax)&&!H(ax)){av++}});return av}function ar(av){var ax,aw;O(av.childNodes,function(ay){if(ay.nodeType==1&&!H(ay)&&!b(ay)){ax=ay;return R}});if(ax&&h(ax,ah)){aw=ax.cloneNode(R);V(aw);c.replace(aw,av,B);c.remove(ax,1)}return aw||av}aq=au(at);if((ak.length>1||!F(at))&&aq===0){c.remove(at,1);return}if(ah.inline||ah.wrapper){if(!ah.exact&&aq===1){at=ar(at)}O(ac,function(av){O(c.select(av.inline,at),function(ax){var aw;if(av.wrap_links===false){aw=ax.parentNode;do{if(aw.nodeName==="A"){return}}while(aw=aw.parentNode)}T(av,ag,ax,av.exact?ax:null)})});if(x(at.parentNode,Y,ag)){c.remove(at,1);at=0;return B}if(ah.merge_with_parents){c.getParent(at.parentNode,function(av){if(x(av,Y,ag)){c.remove(at,1);at=0;return B}})}if(at&&ah.merge_siblings!==false){at=u(C(at),at);at=u(at,C(at,B))}}})}if(ah){if(ab){if(ab.nodeType){W=c.createRng();W.setStartBefore(ab);W.setEndAfter(ab);ai(o(W,ac),null,true)}else{ai(ab,null,true)}}else{if(!ad||!ah.inline||c.select("td.mceSelected,th.mceSelected").length){var aj=U.selection.getNode();U.selection.setRng(aa());af=q.getBookmark();ai(o(q.getRng(B),ac),af);if(ah.styles&&(ah.styles.color||ah.styles.textDecoration)){a.walk(aj,I,"childNodes");I(aj)}q.moveToBookmark(af);q.setRng(Z(q.getRng(B)));U.nodeChanged()}else{P("apply",Y,ag)}}}}function A(X,ag,aa){var ab=Q(X),ai=ab[0],af,ae,W;function Z(al){var ak=al.startContainer,aq=al.startOffset,ap,ao,am,an;if(ak.nodeType==3&&aq>=ak.nodeValue.length-1){ak=ak.parentNode;aq=s(ak)+1}if(ak.nodeType==1){am=ak.childNodes;ak=am[Math.min(aq,am.length-1)];ap=new t(ak);if(aq>am.length-1){ap.next()}for(ao=ap.current();ao;ao=ap.next()){if(ao.nodeType==3&&!f(ao)){an=c.create("a",null,E);ao.parentNode.insertBefore(an,ao);al.setStart(ao,0);q.setRng(al);c.remove(an);return}}}}function Y(an){var am,al,ak;am=a.grep(an.childNodes);for(al=0,ak=ab.length;al<ak;al++){if(T(ab[al],ag,an,an)){break}}if(ai.deep){for(al=0,ak=am.length;al<ak;al++){Y(am[al])}}}function ac(ak){var al;O(m(ak.parentNode).reverse(),function(am){var an;if(!al&&am.id!="_start"&&am.id!="_end"){an=x(am,X,ag);if(an&&an.split!==false){al=am}}});return al}function V(an,ak,ap,at){var au,ar,aq,am,ao,al;if(an){al=an.parentNode;for(au=ak.parentNode;au&&au!=al;au=au.parentNode){ar=au.cloneNode(R);for(ao=0;ao<ab.length;ao++){if(T(ab[ao],ag,ar,ar)){ar=0;break}}if(ar){if(aq){ar.appendChild(aq)}if(!am){am=ar}aq=ar}}if(at&&(!ai.mixed||!F(an))){ak=c.split(an,ak)}if(aq){ap.parentNode.insertBefore(aq,ap);am.appendChild(ap)}}return ak}function ah(ak){return V(ac(ak),ak,ak,true)}function ad(am){var al=c.get(am?"_start":"_end"),ak=al[am?"firstChild":"lastChild"];if(H(ak)){ak=ak[am?"firstChild":"lastChild"]}c.remove(al,true);return ak}function aj(ak){var al,am;ak=o(ak,ab,B);if(ai.split){al=J(ak,B);am=J(ak);if(al!=am){al=N(al,"span",{id:"_start","data-mce-type":"bookmark"});am=N(am,"span",{id:"_end","data-mce-type":"bookmark"});ah(al);ah(am);al=ad(B);am=ad()}else{al=am=ah(al)}ak.startContainer=al.parentNode;ak.startOffset=s(al);ak.endContainer=am.parentNode;ak.endOffset=s(am)+1}K.walk(ak,function(an){O(an,function(ao){Y(ao);if(ao.nodeType===1&&U.dom.getStyle(ao,"text-decoration")==="underline"&&ao.parentNode&&i(ao.parentNode)==="underline"){T({deep:false,exact:true,inline:"span",styles:{textDecoration:"underline"}},null,ao)}})})}if(aa){if(aa.nodeType){W=c.createRng();W.setStartBefore(aa);W.setEndAfter(aa);aj(W)}else{aj(aa)}return}if(!q.isCollapsed()||!ai.inline||c.select("td.mceSelected,th.mceSelected").length){af=q.getBookmark();aj(q.getRng(B));q.moveToBookmark(af);if(ai.inline&&j(X,ag,q.getStart())){Z(q.getRng(true))}U.nodeChanged()}else{P("remove",X,ag)}if(a.isWebKit){U.execCommand("mceCleanup")}}function D(W,Y,X){var V=Q(W);if(j(W,Y,X)&&(!("toggle" in V[0])||V[0]["toggle"])){A(W,Y,X)}else{S(W,Y,X)}}function x(W,V,ab,Z){var X=Q(V),ac,aa,Y;function ad(ah,aj,ak){var ag,ai,ae=aj[ak],af;if(aj.onmatch){return aj.onmatch(ah,aj,ak)}if(ae){if(ae.length===p){for(ag in ae){if(ae.hasOwnProperty(ag)){if(ak==="attributes"){ai=c.getAttrib(ah,ag)}else{ai=L(ah,ag)}if(Z&&!ai&&!aj.exact){return}if((!Z||aj.exact)&&!g(ai,r(ae[ag],ab))){return}}}}else{for(af=0;af<ae.length;af++){if(ak==="attributes"?c.getAttrib(ah,ae[af]):L(ah,ae[af])){return aj}}}}return aj}if(X&&W){for(aa=0;aa<X.length;aa++){ac=X[aa];if(h(W,ac)&&ad(W,ac,"attributes")&&ad(W,ac,"styles")){if(Y=ac.classes){for(aa=0;aa<Y.length;aa++){if(!c.hasClass(W,Y[aa])){return}}}return ac}}}}function j(X,Z,Y){var W;function V(aa){aa=c.getParent(aa,function(ab){return !!x(ab,X,Z,true)});return x(aa,X,Z)}if(Y){return V(Y)}Y=q.getNode();if(V(Y)){return B}W=q.getStart();if(W!=Y){if(V(W)){return B}}return R}function v(ac,ab){var Z,aa=[],Y={},X,W,V;Z=q.getStart();c.getParent(Z,function(af){var ae,ad;for(ae=0;ae<ac.length;ae++){ad=ac[ae];if(!Y[ad]&&x(af,ad,ab)){Y[ad]=true;aa.push(ad)}}});return aa}function y(Z){var ab=Q(Z),Y,X,aa,W,V;if(ab){Y=q.getStart();X=m(Y);for(W=ab.length-1;W>=0;W--){V=ab[W].selector;if(!V){return B}for(aa=X.length-1;aa>=0;aa--){if(c.is(X[aa],V)){return B}}}}return R}a.extend(this,{get:Q,register:k,apply:S,remove:A,toggle:D,match:j,matchAll:v,matchNode:x,canApply:y});function h(V,W){if(g(V,W.inline)){return B}if(g(V,W.block)){return B}if(W.selector){return c.is(V,W.selector)}}function g(W,V){W=W||"";V=V||"";W=""+(W.nodeName||W);V=""+(V.nodeName||V);return W.toLowerCase()==V.toLowerCase()}function L(W,V){var X=c.getStyle(W,V);if(V=="color"||V=="backgroundColor"){X=c.toHex(X)}if(V=="fontWeight"&&X==700){X="bold"}return""+X}function r(V,W){if(typeof(V)!="string"){V=V(W)}else{if(W){V=V.replace(/%(\w+)/g,function(Y,X){return W[X]||Y})}}return V}function f(V){return V&&V.nodeType===3&&/^([\t \r\n]+|)$/.test(V.nodeValue)}function N(X,W,V){var Y=c.create(W,V);X.parentNode.insertBefore(Y,X);Y.appendChild(X);return Y}function o(V,ah,Y){var X=V.startContainer,ac=V.startOffset,ak=V.endContainer,ae=V.endOffset,aj,ag,ab,af;function ai(aq){var al,ao,ap,an,am;al=ao=aq?X:ak;am=aq?"previousSibling":"nextSibling";root=c.getRoot();if(al.nodeType==3&&!f(al)){if(aq?ac>0:ae<al.nodeValue.length){return al}}for(;;){if(ao==root||(!ah[0].block_expand&&F(ao))){return ao}for(an=ao[am];an;an=an[am]){if(!H(an)&&!f(an)){return ao}}ao=ao.parentNode}return al}function aa(al,am){if(am===p){am=al.nodeType===3?al.length:al.childNodes.length}while(al&&al.hasChildNodes()){al=al.childNodes[am];if(al){am=al.nodeType===3?al.length:al.childNodes.length}}return{node:al,offset:am}}if(X.nodeType==1&&X.hasChildNodes()){ag=X.childNodes.length-1;X=X.childNodes[ac>ag?ag:ac];if(X.nodeType==3){ac=0}}if(ak.nodeType==1&&ak.hasChildNodes()){ag=ak.childNodes.length-1;ak=ak.childNodes[ae>ag?ag:ae-1];if(ak.nodeType==3){ae=ak.nodeValue.length}}if(H(X.parentNode)||H(X)){X=H(X)?X:X.parentNode;X=X.nextSibling||X;if(X.nodeType==3){ac=0}}if(H(ak.parentNode)||H(ak)){ak=H(ak)?ak:ak.parentNode;ak=ak.previousSibling||ak;if(ak.nodeType==3){ae=ak.length}}if(ah[0].inline){if(V.collapsed){function ad(am,aq,at){var ap,an,ar,al;function ao(av,ax){var ay,au,aw=av.nodeValue;if(typeof(ax)=="undefined"){ax=at?aw.length:0}if(at){ay=aw.lastIndexOf(" ",ax);au=aw.lastIndexOf("\u00a0",ax);ay=ay>au?ay:au;if(ay!==-1&&!Y){ay++}}else{ay=aw.indexOf(" ",ax);au=aw.indexOf("\u00a0",ax);ay=ay!==-1&&(au===-1||ay<au)?ay:au}return ay}if(am.nodeType===3){ar=ao(am,aq);if(ar!==-1){return{container:am,offset:ar}}al=am}ap=new t(am,c.getParent(am,F)||U.getBody());while(an=ap[at?"prev":"next"]()){if(an.nodeType===3){al=an;ar=ao(an);if(ar!==-1){return{container:an,offset:ar}}}else{if(F(an)){break}}}if(al){if(at){aq=0}else{aq=al.length}return{container:al,offset:aq}}}af=ad(X,ac,true);if(af){X=af.container;ac=af.offset}af=ad(ak,ae);if(af){ak=af.container;ae=af.offset}}ab=aa(ak,ae);if(ab.node){while(ab.node&&ab.offset===0&&ab.node.previousSibling){ab=aa(ab.node.previousSibling)}if(ab.node&&ab.offset>0&&ab.node.nodeType===3&&ab.node.nodeValue.charAt(ab.offset-1)===" "){if(ab.offset>1){ak=ab.node;ak.splitText(ab.offset-1)}else{if(ab.node.previousSibling){}}}}}if(ah[0].inline||ah[0].block_expand){if(!ah[0].inline||(X.nodeType!=3||ac===0)){X=ai(true)}if(!ah[0].inline||(ak.nodeType!=3||ae===ak.nodeValue.length)){ak=ai()}}if(ah[0].selector&&ah[0].expand!==R&&!ah[0].inline){function Z(am,al){var an,ao,aq,ap;if(am.nodeType==3&&am.nodeValue.length==0&&am[al]){am=am[al]}an=m(am);for(ao=0;ao<an.length;ao++){for(aq=0;aq<ah.length;aq++){ap=ah[aq];if("collapsed" in ap&&ap.collapsed!==V.collapsed){continue}if(c.is(an[ao],ap.selector)){return an[ao]}}}return am}X=Z(X,"previousSibling");ak=Z(ak,"nextSibling")}if(ah[0].block||ah[0].selector){function W(am,al,ao){var an;if(!ah[0].wrapper){an=c.getParent(am,ah[0].block)}if(!an){an=c.getParent(am.nodeType==3?am.parentNode:am,F)}if(an&&ah[0].wrapper){an=m(an,"ul,ol").reverse()[0]||an}if(!an){an=am;while(an[al]&&!F(an[al])){an=an[al];if(g(an,"br")){break}}}return an||am}X=W(X,"previousSibling");ak=W(ak,"nextSibling");if(ah[0].block){if(!F(X)){X=ai(true)}if(!F(ak)){ak=ai()}}}if(X.nodeType==1){ac=s(X);X=X.parentNode}if(ak.nodeType==1){ae=s(ak)+1;ak=ak.parentNode}return{startContainer:X,startOffset:ac,endContainer:ak,endOffset:ae}}function T(ab,aa,Y,V){var X,W,Z;if(!h(Y,ab)){return R}if(ab.remove!="all"){O(ab.styles,function(ad,ac){ad=r(ad,aa);if(typeof(ac)==="number"){ac=ad;V=0}if(!V||g(L(V,ac),ad)){c.setStyle(Y,ac,"")}Z=1});if(Z&&c.getAttrib(Y,"style")==""){Y.removeAttribute("style");Y.removeAttribute("data-mce-style")}O(ab.attributes,function(ae,ac){var ad;ae=r(ae,aa);if(typeof(ac)==="number"){ac=ae;V=0}if(!V||g(c.getAttrib(V,ac),ae)){if(ac=="class"){ae=c.getAttrib(Y,ac);if(ae){ad="";O(ae.split(/\s+/),function(af){if(/mce\w+/.test(af)){ad+=(ad?" ":"")+af}});if(ad){c.setAttrib(Y,ac,ad);return}}}if(ac=="class"){Y.removeAttribute("className")}if(e.test(ac)){Y.removeAttribute("data-mce-"+ac)}Y.removeAttribute(ac)}});O(ab.classes,function(ac){ac=r(ac,aa);if(!V||c.hasClass(V,ac)){c.removeClass(Y,ac)}});W=c.getAttribs(Y);for(X=0;X<W.length;X++){if(W[X].nodeName.indexOf("_")!==0){return R}}}if(ab.remove!="none"){n(Y,ab);return B}}function n(X,Y){var V=X.parentNode,W;if(Y.block){if(!l){function Z(ab,aa,ac){ab=C(ab,aa,ac);return !ab||(ab.nodeName=="BR"||F(ab))}if(F(X)&&!F(V)){if(!Z(X,R)&&!Z(X.firstChild,B,1)){X.insertBefore(c.create("br"),X.firstChild)}if(!Z(X,B)&&!Z(X.lastChild,R,1)){X.appendChild(c.create("br"))}}}else{if(V==c.getRoot()){if(!Y.list_block||!g(X,Y.list_block)){O(a.grep(X.childNodes),function(aa){if(d(l,aa.nodeName.toLowerCase())){if(!W){W=N(aa,l)}else{W.appendChild(aa)}}else{W=0}})}}}}if(Y.selector&&Y.inline&&!g(Y.inline,X)){return}c.remove(X,1)}function C(W,V,X){if(W){V=V?"nextSibling":"previousSibling";for(W=X?W:W[V];W;W=W[V]){if(W.nodeType==1||!f(W)){return W}}}}function H(V){return V&&V.nodeType==1&&V.getAttribute("data-mce-type")=="bookmark"}function u(Z,Y){var V,X,W;function ab(ae,ad){if(ae.nodeName!=ad.nodeName){return R}function ac(ag){var ah={};O(c.getAttribs(ag),function(ai){var aj=ai.nodeName.toLowerCase();if(aj.indexOf("_")!==0&&aj!=="style"){ah[aj]=c.getAttrib(ag,aj)}});return ah}function af(aj,ai){var ah,ag;for(ag in aj){if(aj.hasOwnProperty(ag)){ah=ai[ag];if(ah===p){return R}if(aj[ag]!=ah){return R}delete ai[ag]}}for(ag in ai){if(ai.hasOwnProperty(ag)){return R}}return B}if(!af(ac(ae),ac(ad))){return R}if(!af(c.parseStyle(c.getAttrib(ae,"style")),c.parseStyle(c.getAttrib(ad,"style")))){return R}return B}if(Z&&Y){function aa(ad,ac){for(X=ad;X;X=X[ac]){if(X.nodeType==3&&X.nodeValue.length!==0){return ad}if(X.nodeType==1&&!H(X)){return X}}return ad}Z=aa(Z,"previousSibling");Y=aa(Y,"nextSibling");if(ab(Z,Y)){for(X=Z.nextSibling;X&&X!=Y;){W=X;X=X.nextSibling;Z.appendChild(W)}c.remove(Y);O(a.grep(Y.childNodes),function(ac){Z.appendChild(ac)});return Z}}return Y}function G(V){return/^(h[1-6]|p|div|pre|address|dl|dt|dd)$/.test(V)}function J(W,aa){var V,Z,X,Y;V=W[aa?"startContainer":"endContainer"];Z=W[aa?"startOffset":"endOffset"];if(V.nodeType==1){X=V.childNodes.length-1;if(!aa&&Z){Z--}V=V.childNodes[Z>X?X:Z]}if(V.nodeType===3&&aa&&Z>=V.nodeValue.length){V=new t(V,U.getBody()).next()||V}if(V.nodeType===3&&!aa&&Z==0){V=new t(V,U.getBody()).prev()||V}return V}function P(ae,V,ac){var ah,af="_mce_caret",W=U.settings.caret_debug;ah=a.isGecko?"\u200B":E;function X(aj){var ai=c.create("span",{id:af,"data-mce-bogus":true,style:W?"color:red":""});if(aj){ai.appendChild(U.getDoc().createTextNode(ah))}return ai}function ad(aj,ai){while(aj){if((aj.nodeType===3&&aj.nodeValue!==ah)||aj.childNodes.length>1){return false}if(ai&&aj.nodeType===1){ai.push(aj)}aj=aj.firstChild}return true}function aa(ai){while(ai){if(ai.id===af){return ai}ai=ai.parentNode}}function Z(ai){var aj;if(ai){aj=new t(ai,ai);for(ai=aj.current();ai;ai=aj.next()){if(ai.nodeType===3){return ai}}}}function Y(ak,aj){var al,ai;if(!ak){ak=aa(q.getStart());if(!ak){while(ak=c.get(af)){Y(ak,false)}}}else{ai=q.getRng(true);if(ad(ak)){if(aj!==false){ai.setStartBefore(ak);ai.setEndBefore(ak)}c.remove(ak)}else{al=Z(ak);al=al.deleteData(0,1);c.remove(ak,1)}q.setRng(ai)}}function ab(){var ak,ai,ao,an,al,aj,am;ak=q.getRng(true);an=ak.startOffset;aj=ak.startContainer;am=aj.nodeValue;ai=aa(q.getStart());if(ai){ao=Z(ai)}if(am&&an>0&&an<am.length&&/\w/.test(am.charAt(an))&&/\w/.test(am.charAt(an-1))){al=q.getBookmark();ak.collapse(true);ak=o(ak,Q(V));ak=K.split(ak);S(V,ac,ak);q.moveToBookmark(al)}else{if(!ai||ao.nodeValue!==ah){ai=X(true);ao=ai.firstChild;ak.insertNode(ai);an=1;S(V,ac,ai)}else{S(V,ac,ai)}q.setCursorLocation(ao,an)}}function ag(){var ai=q.getRng(true),aj,al,ao,an,ak,ar,aq=[],am,ap;aj=ai.startContainer;al=ai.startOffset;ak=aj;if(aj.nodeType==3){if(al!=aj.nodeValue.length||aj.nodeValue===ah){an=true}ak=ak.parentNode}while(ak){if(x(ak,V,ac)){ar=ak;break}if(ak.nextSibling){an=true}aq.push(ak);ak=ak.parentNode}if(!ar){return}if(an){ao=q.getBookmark();ai.collapse(true);ai=o(ai,Q(V),true);ai=K.split(ai);A(V,ac,ai);q.moveToBookmark(ao)}else{ap=X();ak=ap;for(am=aq.length-1;am>=0;am--){ak.appendChild(aq[am].cloneNode(false));ak=ak.firstChild}ak.appendChild(c.doc.createTextNode(ah));ak=ak.firstChild;c.insertAfter(ap,ar);q.setCursorLocation(ak,1)}}U.onBeforeGetContent.addToTop(function(){var ai=[],aj;if(ad(aa(q.getStart()),ai)){aj=ai.length;while(aj--){c.setAttrib(ai[aj],"data-mce-bogus","1")}}});a.each("onMouseUp onKeyUp".split(" "),function(ai){U[ai].addToTop(function(){Y()})});U.onKeyDown.addToTop(function(ai,ak){var aj=ak.keyCode;if(aj==8||aj==37||aj==39){Y(aa(q.getStart()))}});if(ae=="apply"){ab()}else{ag()}}}})(tinymce);tinymce.onAddEditor.add(function(e,a){var d,h,g,c=a.settings;if(c.inline_styles){h=e.explode(c.font_size_legacy_values);function b(j,i){e.each(i,function(l,k){if(l){g.setStyle(j,k,l)}});g.rename(j,"span")}d={font:function(j,i){b(i,{backgroundColor:i.style.backgroundColor,color:i.color,fontFamily:i.face,fontSize:h[parseInt(i.size)-1]})},u:function(j,i){b(i,{textDecoration:"underline"})},strike:function(j,i){b(i,{textDecoration:"line-through"})}};function f(i,j){g=i.dom;if(c.convert_fonts_to_spans){e.each(g.select("font,u,strike",j.node),function(k){d[k.nodeName.toLowerCase()](a.dom,k)})}}a.onPreProcess.add(f);a.onSetContent.add(f);a.onInit.add(function(){a.selection.onSetContent.add(f)})}});

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());

if(typeof deconcept == "undefined") var deconcept = new Object();
if(typeof deconcept.util == "undefined") deconcept.util = new Object();
if(typeof deconcept.SWFObjectUtil == "undefined") deconcept.SWFObjectUtil = new Object();
deconcept.SWFObject = function(swf, id, w, h, ver, c, useExpressInstall, quality, xiRedirectUrl, redirectUrl, detectKey){
	if (!document.createElement || !document.getElementById) { return; }
	this.DETECT_KEY = detectKey ? detectKey : 'detectflash';
	this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
	this.params = new Object();
	this.variables = new Object();
	this.attributes = new Array();
	this.jsfc = new JSFCommunicator();
	if(swf) { this.setAttribute('swf', swf); }
	if(id) { this.setAttribute('id', id); }
	if(w) { this.setAttribute('width', w); }
	if(h) { this.setAttribute('height', h); }
	if(ver) { this.setAttribute('version', new deconcept.PlayerVersion(ver.toString().split("."))); }
	this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion(this.getAttribute('version'), useExpressInstall);
	if(c) { this.addParam('bgcolor', c); }
	var q = quality ? quality : 'high';
	this.addParam('quality', q);
	this.setAttribute('useExpressInstall', useExpressInstall);
	this.setAttribute('doExpressInstall', false);
	var xir = (xiRedirectUrl) ? xiRedirectUrl : window.location;
	this.setAttribute('xiRedirectUrl', xir);
	this.setAttribute('redirectUrl', '');
	if(redirectUrl) { this.setAttribute('redirectUrl', redirectUrl); }
}
deconcept.SWFObject.prototype = {
	setVariable: function(name, value){
		this.jsfc.setVariable(name, value);
	},
	callFunction: function(fnLocation, fnName, fnArgs){
		//jsfc.callFunction(“_root”,“myFlashFunction”,[“param1”,”param2”]);
		this.jsfc.callFunction(fnLocation, fnName, fnArgs);
	},
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},
	getAttribute: function(name){
		return this.attributes[name];
	},
	addParam: function(name, value){
		this.params[name] = value;
	},
	getParams: function(){
		return this.params;
	},
	addVariable: function(name, value){
		this.variables[name] = value;
	},
	getVariable: function(name){
		return this.variables[name];
	},
	getVariables: function(){
		return this.variables;
	},
	getVariablePairs: function(){
		var variablePairs = new Array();
		var key;
		var variables = this.getVariables();
		for(key in variables){
			variablePairs.push(key +"="+ variables[key]);
		}
		return variablePairs;
	},
	getSWFHTML: function() {
		var swfNode = "";
		if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) { // netscape plugin architecture
			if (this.getAttribute("doExpressInstall")) this.addVariable("MMplayerType", "PlugIn");
			swfNode = '<embed type="application/x-shockwave-flash" src="'+ this.getAttribute('swf') +'" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'"';
			swfNode += ' id="'+ this.getAttribute('id') +'" name="'+ this.getAttribute('id') +'" ';
			var params = this.getParams();
			 for(var key in params){ swfNode += [key] +'="'+ params[key] +'" '; }
			var pairs = this.getVariablePairs().join("&");
			 if (pairs.length > 0){ swfNode += 'flashvars="'+ pairs +'"'; }
			swfNode += '/>';
		} else { // PC IE
			if (this.getAttribute("doExpressInstall")) this.addVariable("MMplayerType", "ActiveX");
			swfNode = '<object id="'+ this.getAttribute('id') +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'">';
			swfNode += '<param name="movie" value="'+ this.getAttribute('swf') +'" />';
			var params = this.getParams();
			for(var key in params) {
			 swfNode += '<param name="'+ key +'" value="'+ params[key] +'" />';
			}
			//swfNode += '<param name="wmode" value="transparent" />';
			var pairs = this.getVariablePairs().join("&");
			if(pairs.length > 0) {swfNode += '<param name="flashvars" value="'+ pairs +'" />';}
			swfNode += "</object>";
		}
		return swfNode;
	},
	write: function(elementId){
		if(this.getAttribute('useExpressInstall')) {
			// check to see if we need to do an express install
			var expressInstallReqVer = new deconcept.PlayerVersion([6,0,65]);
			if (this.installedVer.versionIsValid(expressInstallReqVer) && !this.installedVer.versionIsValid(this.getAttribute('version'))) {
				this.setAttribute('doExpressInstall', true);
				this.addVariable("MMredirectURL", escape(this.getAttribute('xiRedirectUrl')));
				document.title = document.title.slice(0, 47) + " - Flash Player Installation";
				this.addVariable("MMdoctitle", document.title);
			}
		}
		if(this.skipDetect || this.getAttribute('doExpressInstall') || this.installedVer.versionIsValid(this.getAttribute('version'))){
			var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
			n.innerHTML = this.getSWFHTML();
			this.jsfc.setMovie(getMovie(this.getAttribute('id')));
			return true;
		}else{
			if(this.getAttribute('redirectUrl') != "") {
				document.location.replace(this.getAttribute('redirectUrl'));
			}
		}
		return false;
	}
}

/* ---- detection functions ---- */
deconcept.SWFObjectUtil.getPlayerVersion = function(reqVer, xiInstall){
	var PlayerVersion = new deconcept.PlayerVersion([0,0,0]);
	if(navigator.plugins && navigator.mimeTypes.length){
		var x = navigator.plugins["Shockwave Flash"];
		if(x && x.description) {
			PlayerVersion = new deconcept.PlayerVersion(x.description.replace(/([a-z]|[A-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
		}
	}else{
		try{
			var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			for (var i=3; axo!=null; i++) {
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+i);
				PlayerVersion = new deconcept.PlayerVersion([i,0,0]);
			}
		}catch(e){}
		if (reqVer && PlayerVersion.major > reqVer.major) return PlayerVersion; // version is ok, skip minor detection
		// this only does the minor rev lookup if the user's major version 
		// is not 6 or we are checking for a specific minor or revision number
		// see http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
		if (!reqVer || ((reqVer.minor != 0 || reqVer.rev != 0) && PlayerVersion.major == reqVer.major) || PlayerVersion.major != 6 || xiInstall) {
			try{
				PlayerVersion = new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
			}catch(e){}
		}
	}
	return PlayerVersion;
}
deconcept.PlayerVersion = function(arrVersion){
	this.major = parseInt(arrVersion[0]) != null ? parseInt(arrVersion[0]) : 0;
	this.minor = parseInt(arrVersion[1]) || 0;
	this.rev = parseInt(arrVersion[2]) || 0;
}
deconcept.PlayerVersion.prototype.versionIsValid = function(fv){
	if(this.major < fv.major) return false;
	if(this.major > fv.major) return true;
	if(this.minor < fv.minor) return false;
	if(this.minor > fv.minor) return true;
	if(this.rev < fv.rev) return false;
	return true;
}
/* ---- get value of query string param ---- */
deconcept.util = {
	getRequestParameter: function(param){
		var q = document.location.search || document.location.hash;
		if(q){
			var startIndex = q.indexOf(param +"=");
			var endIndex = (q.indexOf("&", startIndex) > -1) ? q.indexOf("&", startIndex) : q.length;
			if (q.length > 1 && startIndex > -1) {
				return q.substring(q.indexOf("=", startIndex)+1, endIndex);
			}
		}
		return "";
	}
}

/* fix for video streaming bug */
/*
deconcept.SWFObjectUtil.cleanupSWFs = function() {
	var objects = document.getElementsByTagName("OBJECT");
	for (var i=0; i < objects.length; i++) {
		for (var x in objects[i]) {
			if (typeof objects[i][x] == 'function') {
				objects[i][x] = null;
			}
		}
	}
}
if (typeof window.onunload == 'function') {
	var oldunload = window.onunload;
		window.onunload = function() {
		deconcept.SWFObjectUtil.cleanupSWFs();
		oldunload();
	}
} else {
	window.onunload = deconcept.SWFObjectUtil.cleanupSWFs;
}
*/

/* add Array.push if needed (ie5) */
if (Array.prototype.push == null) { Array.prototype.push = function(item) { this[this.length] = item; return this.length; }}

/* add some aliases for ease of use/backwards compatibility */
var getQueryParamValue = deconcept.util.getRequestParameter;
var FlashObject = deconcept.SWFObject; // for legacy support
var SWFObject = deconcept.SWFObject;



/***************************************************************************************/
/***************************************************************************************/
/***************************************************************************************/
/*

 * CLASS: JSFCommunicator
 * AUTHOR: Abdul Qabiz 
 * DATE  : 12/13/2003
	
 * @constructor JSFCommunicator
 * @param flashMovie:Refrence to activeX or Plugin
 * @description This is constructor function of JSFCommunicator class

*/

function JSFCommunicator(flashMovie)
{	
	this.init(flashMovie);
}

/**
 * @method init()
 * @param flashMovie:Reference to ActiveX or Plugin object
 * @return none
 * @description initializes all variables for communication
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/
JSFCommunicator.prototype.init = function(flashMovie) {

	if(flashMovie=="undefined") {
		var flashMovie = null;
	 }
	this.setMovie(flashMovie);
	this.functionToCall = null;
	this.functionLocationinFlash = null;
	this.functionArgs = null;
}


/**
 * @method setMovie(flashMovie)
 * @param flashMovie:Reference to ActiveX or Plugin object
 * @return none
 * @description initializes all variables for communication
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/

JSFCommunicator.prototype.setMovie = function(flashMovie)
{
	this.flashMovie = flashMovie;
}


/**
 * @method setVariable(propName,propValue)
 * @param propName:String, variable name in flash to be set.
 * @param propValue:any primitive type
 * @return none
 * @description Sets a variable in flash
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/
JSFCommunicator.prototype.setVariable  = function(propName, propValue) {
	this.flashMovie.SetVariable(propName,propValue);
}



/**
 * @method getVariable(propName)
 * @param propName:String, variable name in flash
 * @return Any primitive value
 * @description Gets a specified properties value from flash
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/
JSFCommunicator.prototype.getVariable  = function(propName) {
	var result = this.flashMovie.GetVariable(propName);
	return result;
}


/**
 * @method callFunction(fnLocation,fnName, fnArgs)
 * @param fnLocation:String, funtion's parent objects path in flash. e.g. _root or _level0 or _level0.my_mc etc
 * @param fnName:String, name of flash function be executed
 * @param fnArgs:Array, parameters to be passed to flash function. only primitive data can be passed
 * @return Boolean, depending upon the success or failure of the call made
 * @description calls a specified flash function from javascript
 * @author Abdul Qabiz
 * @data Dec 12, 2003
*/
JSFCommunicator.prototype.callFunction = function(fnLocation,fnName,fnArgs) {

	if(this.flashMovie==null) {	return false; }
	
//	get the current value of triggerFn from flash
	var flag = this.getVariable("/:triggerFn");
	var result = false;

//	if no function name passed, return false
	if(fnName=="") {return false; }
//	if 	fnLocation is not proper, set it to _level0 as default
	if(fnLocation=="") {
		var fnLocation = "_level0";
	}

	this.setVariable("/:fnLocation",fnLocation);
	this.setVariable("/:fnName",fnName);
	
//	check if fnArgs is an array
	if(typeof(fnArgs)=="object") {
//		convert it to $@$$-delemited string and pass to flash
		this.setVariable("/:fnArgs",fnArgs.join("$@$$"));
	}else if(typeof(fnArgs)=="number" || typeof(fnArgs)=="string") {
		this.setVariable("/:fnArgs",fnArgs);
	}
	
//	change triggerFn property in flash which being watched
	this.setVariable("/:triggerFn",!flag);

//	check if function in flash called successfully or not.
	result = this.getVariable("triggerFnStatus");
	
//	set triggerFnStatus false again.
	this.setVariable("/:triggerFnStatus",false);

//	return result of call.
	return result;

	
}

//======================================================


function getMovie(movieName) {
	return document.getElementById(movieName);
}
/*! jQuery v1.7.1 jquery.com | jquery.org/license */
(function(a,b){function cy(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cv(a){if(!ck[a]){var b=c.body,d=f("<"+a+">").appendTo(b),e=d.css("display");d.remove();if(e==="none"||e===""){cl||(cl=c.createElement("iframe"),cl.frameBorder=cl.width=cl.height=0),b.appendChild(cl);if(!cm||!cl.createElement)cm=(cl.contentWindow||cl.contentDocument).document,cm.write((c.compatMode==="CSS1Compat"?"<!doctype html>":"")+"<html><body>"),cm.close();d=cm.createElement(a),cm.body.appendChild(d),e=f.css(d,"display"),b.removeChild(cl)}ck[a]=e}return ck[a]}function cu(a,b){var c={};f.each(cq.concat.apply([],cq.slice(0,b)),function(){c[this]=a});return c}function ct(){cr=b}function cs(){setTimeout(ct,0);return cr=f.now()}function cj(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ci(){try{return new a.XMLHttpRequest}catch(b){}}function cc(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function cb(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function ca(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bE.test(a)?d(a,e):ca(a+"["+(typeof e=="object"||f.isArray(e)?b:"")+"]",e,c,d)});else if(!c&&b!=null&&typeof b=="object")for(var e in b)ca(a+"["+e+"]",b[e],c,d);else d(a,b)}function b_(a,c){var d,e,g=f.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((g[d]?a:e||(e={}))[d]=c[d]);e&&f.extend(!0,a,e)}function b$(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bT,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=b$(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=b$(a,c,d,e,"*",g));return l}function bZ(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bP),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function bC(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=b==="width"?bx:by,g=0,h=e.length;if(d>0){if(c!=="border")for(;g<h;g++)c||(d-=parseFloat(f.css(a,"padding"+e[g]))||0),c==="margin"?d+=parseFloat(f.css(a,c+e[g]))||0:d-=parseFloat(f.css(a,"border"+e[g]+"Width"))||0;return d+"px"}d=bz(a,b,b);if(d<0||d==null)d=a.style[b]||0;d=parseFloat(d)||0;if(c)for(;g<h;g++)d+=parseFloat(f.css(a,"padding"+e[g]))||0,c!=="padding"&&(d+=parseFloat(f.css(a,"border"+e[g]+"Width"))||0),c==="margin"&&(d+=parseFloat(f.css(a,c+e[g]))||0);return d+"px"}function bp(a,b){b.src?f.ajax({url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bf,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)}function bo(a){var b=c.createElement("div");bh.appendChild(b),b.innerHTML=a.outerHTML;return b.firstChild}function bn(a){var b=(a.nodeName||"").toLowerCase();b==="input"?bm(a):b!=="script"&&typeof a.getElementsByTagName!="undefined"&&f.grep(a.getElementsByTagName("input"),bm)}function bm(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bl(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bk(a,b){var c;if(b.nodeType===1){b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase();if(c==="object")b.outerHTML=a.outerHTML;else if(c!=="input"||a.type!=="checkbox"&&a.type!=="radio"){if(c==="option")b.selected=a.defaultSelected;else if(c==="input"||c==="textarea")b.defaultValue=a.defaultValue}else a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value);b.removeAttribute(f.expando)}}function bj(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c,d,e,g=f._data(a),h=f._data(b,g),i=g.events;if(i){delete h.handle,h.events={};for(c in i)for(d=0,e=i[c].length;d<e;d++)f.event.add(b,c+(i[c][d].namespace?".":"")+i[c][d].namespace,i[c][d],i[c][d].data)}h.data&&(h.data=f.extend({},h.data))}}function bi(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function U(a){var b=V.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function T(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(O.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function S(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function K(){return!0}function J(){return!1}function n(a,b,c){var d=b+"defer",e=b+"queue",g=b+"mark",h=f._data(a,d);h&&(c==="queue"||!f._data(a,e))&&(c==="mark"||!f._data(a,g))&&setTimeout(function(){!f._data(a,e)&&!f._data(a,g)&&(f.removeData(a,d,!0),h.fire())},0)}function m(a){for(var b in a){if(b==="data"&&f.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function l(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(k,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNumeric(d)?parseFloat(d):j.test(d)?f.parseJSON(d):d}catch(g){}f.data(a,c,d)}else d=b}return d}function h(a){var b=g[a]={},c,d;a=a.split(/\s+/);for(c=0,d=a.length;c<d;c++)b[a[c]]=!0;return b}var c=a.document,d=a.navigator,e=a.location,f=function(){function J(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(J,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,n=/^[\],:{}\s]*$/,o=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,p=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,q=/(?:^|:|,)(?:\s*\[)+/g,r=/(webkit)[ \/]([\w.]+)/,s=/(opera)(?:.*version)?[ \/]([\w.]+)/,t=/(msie) ([\w.]+)/,u=/(mozilla)(?:.*? rv:([\w.]+))?/,v=/-([a-z]|[0-9])/ig,w=/^-ms-/,x=function(a,b){return(b+"").toUpperCase()},y=d.userAgent,z,A,B,C=Object.prototype.toString,D=Object.prototype.hasOwnProperty,E=Array.prototype.push,F=Array.prototype.slice,G=String.prototype.trim,H=Array.prototype.indexOf,I={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=m.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.7.1",length:0,size:function(){return this.length},toArray:function(){return F.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?E.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),A.add(a);return this},eq:function(a){a=+a;return a===-1?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(F.apply(this,arguments),"slice",F.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:E,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;A.fireWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").off("ready")}},bindReady:function(){if(!A){A=e.Callbacks("once memory");if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",B,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",B),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&J()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a&&typeof a=="object"&&"setInterval"in a},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return a==null?String(a):I[C.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;try{if(a.constructor&&!D.call(a,"constructor")&&!D.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||D.call(a,d)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw new Error(a)},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(n.test(b.replace(o,"@").replace(p,"]").replace(q,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(c){var d,f;try{a.DOMParser?(f=new DOMParser,d=f.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(g){d=b}(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&e.error("Invalid XML: "+c);return d},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(w,"ms-").replace(v,x)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:G?function(a){return a==null?"":G.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?E.call(c,a):e.merge(c,a)}return c},inArray:function(a,b,c){var d;if(b){if(H)return H.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=F.call(arguments,2),g=function(){return a.apply(c,f.concat(F.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h){var i=a.length;if(typeof c=="object"){for(var j in c)e.access(a,j,c[j],f,g,d);return a}if(d!==b){f=!h&&f&&e.isFunction(d);for(var k=0;k<i;k++)g(a[k],c,f?d.call(a[k],k,g(a[k],c)):d,h);return a}return i?g(a[0],c):b},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=r.exec(a)||s.exec(a)||t.exec(a)||a.indexOf("compatible")<0&&u.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){I["[object "+b+"]"]=b.toLowerCase()}),z=e.uaMatch(y),z.browser&&(e.browser[z.browser]=!0,e.browser.version=z.version),e.browser.webkit&&(e.browser.safari=!0),j.test("Â ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?B=function(){c.removeEventListener("DOMContentLoaded",B,!1),e.ready()}:c.attachEvent&&(B=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",B),e.ready())});return e}(),g={};f.Callbacks=function(a){a=a?g[a]||h(a):{};var c=[],d=[],e,i,j,k,l,m=function(b){var d,e,g,h,i;for(d=0,e=b.length;d<e;d++)g=b[d],h=f.type(g),h==="array"?m(g):h==="function"&&(!a.unique||!o.has(g))&&c.push(g)},n=function(b,f){f=f||[],e=!a.memory||[b,f],i=!0,l=j||0,j=0,k=c.length;for(;c&&l<k;l++)if(c[l].apply(b,f)===!1&&a.stopOnFalse){e=!0;break}i=!1,c&&(a.once?e===!0?o.disable():c=[]:d&&d.length&&(e=d.shift(),o.fireWith(e[0],e[1])))},o={add:function(){if(c){var a=c.length;m(arguments),i?k=c.length:e&&e!==!0&&(j=a,n(e[0],e[1]))}return this},remove:function(){if(c){var b=arguments,d=0,e=b.length;for(;d<e;d++)for(var f=0;f<c.length;f++)if(b[d]===c[f]){i&&f<=k&&(k--,f<=l&&l--),c.splice(f--,1);if(a.unique)break}}return this},has:function(a){if(c){var b=0,d=c.length;for(;b<d;b++)if(a===c[b])return!0}return!1},empty:function(){c=[];return this},disable:function(){c=d=e=b;return this},disabled:function(){return!c},lock:function(){d=b,(!e||e===!0)&&o.disable();return this},locked:function(){return!d},fireWith:function(b,c){d&&(i?a.once||d.push([b,c]):(!a.once||!e)&&n(b,c));return this},fire:function(){o.fireWith(this,arguments);return this},fired:function(){return!!e}};return o};var i=[].slice;f.extend({Deferred:function(a){var b=f.Callbacks("once memory"),c=f.Callbacks("once memory"),d=f.Callbacks("memory"),e="pending",g={resolve:b,reject:c,notify:d},h={done:b.add,fail:c.add,progress:d.add,state:function(){return e},isResolved:b.fired,isRejected:c.fired,then:function(a,b,c){i.done(a).fail(b).progress(c);return this},always:function(){i.done.apply(i,arguments).fail.apply(i,arguments);return this},pipe:function(a,b,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[b,"reject"],progress:[c,"notify"]},function(a,b){var c=b[0],e=b[1],g;f.isFunction(c)?i[a](function(){g=c.apply(this,arguments),g&&f.isFunction(g.promise)?g.promise().then(d.resolve,d.reject,d.notify):d[e+"With"](this===i?d:this,[g])}):i[a](d[e])})}).promise()},promise:function(a){if(a==null)a=h;else for(var b in h)a[b]=h[b];return a}},i=h.promise({}),j;for(j in g)i[j]=g[j].fire,i[j+"With"]=g[j].fireWith;i.done(function(){e="resolved"},c.disable,d.lock).fail(function(){e="rejected"},b.disable,d.lock),a&&a.call(i,i);return i},when:function(a){function m(a){return function(b){e[a]=arguments.length>1?i.call(arguments,0):b,j.notifyWith(k,e)}}function l(a){return function(c){b[a]=arguments.length>1?i.call(arguments,0):c,--g||j.resolveWith(j,b)}}var b=i.call(arguments,0),c=0,d=b.length,e=Array(d),g=d,h=d,j=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred(),k=j.promise();if(d>1){for(;c<d;c++)b[c]&&b[c].promise&&f.isFunction(b[c].promise)?b[c].promise().then(l(c),j.reject,m(c)):--g;g||j.resolveWith(j,b)}else j!==a&&j.resolveWith(j,d?[a]:[]);return k}}),f.support=function(){var b,d,e,g,h,i,j,k,l,m,n,o,p,q=c.createElement("div"),r=c.documentElement;q.setAttribute("className","t"),q.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>",d=q.getElementsByTagName("*"),e=q.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};g=c.createElement("select"),h=g.appendChild(c.createElement("option")),i=q.getElementsByTagName("input")[0],b={leadingWhitespace:q.firstChild.nodeType===3,tbody:!q.getElementsByTagName("tbody").length,htmlSerialize:!!q.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,checkOn:i.value==="on",optSelected:h.selected,getSetAttribute:q.className!=="t",enctype:!!c.createElement("form").enctype,html5Clone:c.createElement("nav").cloneNode(!0).outerHTML!=="<:nav></:nav>",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0},i.checked=!0,b.noCloneChecked=i.cloneNode(!0).checked,g.disabled=!0,b.optDisabled=!h.disabled;try{delete q.test}catch(s){b.deleteExpando=!1}!q.addEventListener&&q.attachEvent&&q.fireEvent&&(q.attachEvent("onclick",function(){b.noCloneEvent=!1}),q.cloneNode(!0).fireEvent("onclick")),i=c.createElement("input"),i.value="t",i.setAttribute("type","radio"),b.radioValue=i.value==="t",i.setAttribute("checked","checked"),q.appendChild(i),k=c.createDocumentFragment(),k.appendChild(q.lastChild),b.checkClone=k.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=i.checked,k.removeChild(i),k.appendChild(q),q.innerHTML="",a.getComputedStyle&&(j=c.createElement("div"),j.style.width="0",j.style.marginRight="0",q.style.width="2px",q.appendChild(j),b.reliableMarginRight=(parseInt((a.getComputedStyle(j,null)||{marginRight:0}).marginRight,10)||0)===0);if(q.attachEvent)for(o in{submit:1,change:1,focusin:1})n="on"+o,p=n in q,p||(q.setAttribute(n,"return;"),p=typeof q[n]=="function"),b[o+"Bubbles"]=p;k.removeChild(q),k=g=h=j=q=i=null,f(function(){var a,d,e,g,h,i,j,k,m,n,o,r=c.getElementsByTagName("body")[0];!r||(j=1,k="position:absolute;top:0;left:0;width:1px;height:1px;margin:0;",m="visibility:hidden;border:0;",n="style='"+k+"border:5px solid #000;padding:0;'",o="<div "+n+"><div></div></div>"+"<table "+n+" cellpadding='0' cellspacing='0'>"+"<tr><td></td></tr></table>",a=c.createElement("div"),a.style.cssText=m+"width:0;height:0;position:static;top:0;margin-top:"+j+"px",r.insertBefore(a,r.firstChild),q=c.createElement("div"),a.appendChild(q),q.innerHTML="<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>",l=q.getElementsByTagName("td"),p=l[0].offsetHeight===0,l[0].style.display="",l[1].style.display="none",b.reliableHiddenOffsets=p&&l[0].offsetHeight===0,q.innerHTML="",q.style.width=q.style.paddingLeft="1px",f.boxModel=b.boxModel=q.offsetWidth===2,typeof q.style.zoom!="undefined"&&(q.style.display="inline",q.style.zoom=1,b.inlineBlockNeedsLayout=q.offsetWidth===2,q.style.display="",q.innerHTML="<div style='width:4px;'></div>",b.shrinkWrapBlocks=q.offsetWidth!==2),q.style.cssText=k+m,q.innerHTML=o,d=q.firstChild,e=d.firstChild,h=d.nextSibling.firstChild.firstChild,i={doesNotAddBorder:e.offsetTop!==5,doesAddBorderForTableAndCells:h.offsetTop===5},e.style.position="fixed",e.style.top="20px",i.fixedPosition=e.offsetTop===20||e.offsetTop===15,e.style.position=e.style.top="",d.style.overflow="hidden",d.style.position="relative",i.subtractsBorderForOverflowNotVisible=e.offsetTop===-5,i.doesNotIncludeMarginInBodyOffset=r.offsetTop!==j,r.removeChild(a),q=a=null,f.extend(b,i))});return b}();var j=/^(?:\{.*\}|\[.*\])$/,k=/([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!m(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g,h,i,j=f.expando,k=typeof c=="string",l=a.nodeType,m=l?f.cache:a,n=l?a[j]:a[j]&&j,o=c==="events";if((!n||!m[n]||!o&&!e&&!m[n].data)&&k&&d===b)return;n||(l?a[j]=n=++f.uuid:n=j),m[n]||(m[n]={},l||(m[n].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?m[n]=f.extend(m[n],c):m[n].data=f.extend(m[n].data,c);g=h=m[n],e||(h.data||(h.data={}),h=h.data),d!==b&&(h[f.camelCase(c)]=d);if(o&&!h[c])return g.events;k?(i=h[c],i==null&&(i=h[f.camelCase(c)])):i=h;return i}},removeData:function(a,b,c){if(!!f.acceptData(a)){var d,e,g,h=f.expando,i=a.nodeType,j=i?f.cache:a,k=i?a[h]:h;if(!j[k])return;if(b){d=c?j[k]:j[k].data;if(d){f.isArray(b)||(b in d?b=[b]:(b=f.camelCase(b),b in d?b=[b]:b=b.split(" ")));for(e=0,g=b.length;e<g;e++)delete d[b[e]];if(!(c?m:f.isEmptyObject)(d))return}}if(!c){delete j[k].data;if(!m(j[k]))return}f.support.deleteExpando||!j.setInterval?delete j[k]:j[k]=null,i&&(f.support.deleteExpando?delete a[h]:a.removeAttribute?a.removeAttribute(h):a[h]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d,e,g,h=null;if(typeof a=="undefined"){if(this.length){h=f.data(this[0]);if(this[0].nodeType===1&&!f._data(this[0],"parsedAttrs")){e=this[0].attributes;for(var i=0,j=e.length;i<j;i++)g=e[i].name,g.indexOf("data-")===0&&(g=f.camelCase(g.substring(5)),l(this[0],g,h[g]));f._data(this[0],"parsedAttrs",!0)}}return h}if(typeof a=="object")return this.each(function(){f.data(this,a)});d=a.split("."),d[1]=d[1]?"."+d[1]:"";if(c===b){h=this.triggerHandler("getData"+d[1]+"!",[d[0]]),h===b&&this.length&&(h=f.data(this[0],a),h=l(this[0],a,h));return h===b&&d[1]?this.data(d[0]):h}return this.each(function(){var b=f(this),e=[d[0],c];b.triggerHandler("setData"+d[1]+"!",e),f.data(this,a,c),b.triggerHandler("changeData"+d[1]+"!",e)})},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,b){a&&(b=(b||"fx")+"mark",f._data(a,b,(f._data(a,b)||0)+1))},_unmark:function(a,b,c){a!==!0&&(c=b,b=a,a=!1);if(b){c=c||"fx";var d=c+"mark",e=a?0:(f._data(b,d)||1)-1;e?f._data(b,d,e):(f.removeData(b,d,!0),n(b,c,"mark"))}},queue:function(a,b,c){var d;if(a){b=(b||"fx")+"queue",d=f._data(a,b),c&&(!d||f.isArray(c)?d=f._data(a,b,f.makeArray(c)):d.push(c));return d||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e={};d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),f._data(a,b+".run",e),d.call(a,function(){f.dequeue(a,b)},e)),c.length||(f.removeData(a,b+"queue "+b+".run",!0),n(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){typeof a!="string"&&(c=a,a="fx");if(c===b)return f.queue(this[0],a);return this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f.Callbacks("once memory"),!0))h++,l.add(m);m();return d.promise()}});var o=/[\n\t\r]/g,p=/\s+/,q=/\r/g,r=/^(?:button|input)$/i,s=/^(?:button|input|object|select|textarea)$/i,t=/^a(?:rea)?$/i,u=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,v=f.support.getSetAttribute,w,x,y;f.fn.extend({attr:function(a,b){return f.access(this,a,b,!0,f.attr)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,a,b,!0,f.prop)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,g,h,i;if(f.isFunction(a))return this.each(function(b){f(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(p);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{g=" "+e.className+" ";for(h=0,i=b.length;h<i;h++)~g.indexOf(" "+b[h]+" ")||(g+=b[h]+" ");e.className=f.trim(g)}}}return this},removeClass:function(a){var c,d,e,g,h,i,j;if(f.isFunction(a))return this.each(function(b){f(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(p);for(d=0,e=this.length;d<e;d++){g=this[d];if(g.nodeType===1&&g.className)if(a){h=(" "+g.className+" ").replace(o," ");for(i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){f(this).toggleClass(a.call(this,c,this.className,b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(p);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(o," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e,g=this[0];{if(!!arguments.length){e=f.isFunction(a);return this.each(function(d){var g=f(this),h;if(this.nodeType===1){e?h=a.call(this,d,g.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.nodeName.toLowerCase()]||f.valHooks[this.type];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}if(g){c=f.valHooks[g.nodeName.toLowerCase()]||f.valHooks[g.type];if(c&&"get"in c&&(d=c.get(g,"value"))!==b)return d;d=g.value;return typeof d=="string"?d.replace(q,""):d==null?"":d}}}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,g=a.selectedIndex,h=[],i=a.options,j=a.type==="select-one";if(g<0)return null;c=j?g:0,d=j?g+1:i.length;for(;c<d;c++){e=i[c];if(e.selected&&(f.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!f.nodeName(e.parentNode,"optgroup"))){b=f(e).val();if(j)return b;h.push(b)}}if(j&&!h.length&&i.length)return f(i[g]).val();return h},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attr:function(a,c,d,e){var g,h,i,j=a.nodeType;if(!!a&&j!==3&&j!==8&&j!==2){if(e&&c in f.attrFn)return f(a)[c](d);if(typeof a.getAttribute=="undefined")return f.prop(a,c,d);i=j!==1||!f.isXMLDoc(a),i&&(c=c.toLowerCase(),h=f.attrHooks[c]||(u.test(c)?x:w));if(d!==b){if(d===null){f.removeAttr(a,c);return}if(h&&"set"in h&&i&&(g=h.set(a,d,c))!==b)return g;a.setAttribute(c,""+d);return d}if(h&&"get"in h&&i&&(g=h.get(a,c))!==null)return g;g=a.getAttribute(c);return g===null?b:g}},removeAttr:function(a,b){var c,d,e,g,h=0;if(b&&a.nodeType===1){d=b.toLowerCase().split(p),g=d.length;for(;h<g;h++)e=d[h],e&&(c=f.propFix[e]||e,f.attr(a,e,""),a.removeAttribute(v?e:c),u.test(e)&&c in a&&(a[c]=!1))}},attrHooks:{type:{set:function(a,b){if(r.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},value:{get:function(a,b){if(w&&f.nodeName(a,"button"))return w.get(a,b);return b in a?a.value:null},set:function(a,b,c){if(w&&f.nodeName(a,"button"))return w.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,g,h,i=a.nodeType;if(!!a&&i!==3&&i!==8&&i!==2){h=i!==1||!f.isXMLDoc(a),h&&(c=f.propFix[c]||c,g=f.propHooks[c]);return d!==b?g&&"set"in g&&(e=g.set(a,d,c))!==b?e:a[c]=d:g&&"get"in g&&(e=g.get(a,c))!==null?e:a[c]}},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):s.test(a.nodeName)||t.test(a.nodeName)&&a.href?0:b}}}}),f.attrHooks.tabindex=f.propHooks.tabIndex,x={get:function(a,c){var d,e=f.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase()));return c}},v||(y={name:!0,id:!0},w=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&(y[c]?d.nodeValue!=="":d.specified)?d.nodeValue:b},set:function(a,b,d){var e=a.getAttributeNode(d);e||(e=c.createAttribute(d),a.setAttributeNode(e));return e.nodeValue=b+""}},f.attrHooks.tabindex.set=w.set,f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})}),f.attrHooks.contenteditable={get:w.get,set:function(a,b,c){b===""&&(b="false"),w.set(a,b,c)}}),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex);return null}})),f.support.enctype||(f.propFix.enctype="encoding"),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var z=/^(?:textarea|input|select)$/i,A=/^([^\.]*)?(?:\.(.+))?$/,B=/\bhover(\.\S+)?\b/,C=/^key/,D=/^(?:mouse|contextmenu)|click/,E=/^(?:focusinfocus|focusoutblur)$/,F=/^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,G=function(a){var b=F.exec(a);b&&(b[1]=(b[1]||"").toLowerCase(),b[3]=b[3]&&new RegExp("(?:^|\\s)"+b[3]+"(?:\\s|$)"));return b},H=function(a,b){var c=a.attributes||{};return(!b[1]||a.nodeName.toLowerCase()===b[1])&&(!b[2]||(c.id||{}).value===b[2])&&(!b[3]||b[3].test((c["class"]||{}).value))},I=function(a){return f.event.special.hover?a:a.replace(B,"mouseenter$1 mouseleave$1")};
f.event={add:function(a,c,d,e,g){var h,i,j,k,l,m,n,o,p,q,r,s;if(!(a.nodeType===3||a.nodeType===8||!c||!d||!(h=f._data(a)))){d.handler&&(p=d,d=p.handler),d.guid||(d.guid=f.guid++),j=h.events,j||(h.events=j={}),i=h.handle,i||(h.handle=i=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.dispatch.apply(i.elem,arguments):b},i.elem=a),c=f.trim(I(c)).split(" ");for(k=0;k<c.length;k++){l=A.exec(c[k])||[],m=l[1],n=(l[2]||"").split(".").sort(),s=f.event.special[m]||{},m=(g?s.delegateType:s.bindType)||m,s=f.event.special[m]||{},o=f.extend({type:m,origType:l[1],data:e,handler:d,guid:d.guid,selector:g,quick:G(g),namespace:n.join(".")},p),r=j[m];if(!r){r=j[m]=[],r.delegateCount=0;if(!s.setup||s.setup.call(a,e,n,i)===!1)a.addEventListener?a.addEventListener(m,i,!1):a.attachEvent&&a.attachEvent("on"+m,i)}s.add&&(s.add.call(a,o),o.handler.guid||(o.handler.guid=d.guid)),g?r.splice(r.delegateCount++,0,o):r.push(o),f.event.global[m]=!0}a=null}},global:{},remove:function(a,b,c,d,e){var g=f.hasData(a)&&f._data(a),h,i,j,k,l,m,n,o,p,q,r,s;if(!!g&&!!(o=g.events)){b=f.trim(I(b||"")).split(" ");for(h=0;h<b.length;h++){i=A.exec(b[h])||[],j=k=i[1],l=i[2];if(!j){for(j in o)f.event.remove(a,j+b[h],c,d,!0);continue}p=f.event.special[j]||{},j=(d?p.delegateType:p.bindType)||j,r=o[j]||[],m=r.length,l=l?new RegExp("(^|\\.)"+l.split(".").sort().join("\\.(?:.*\\.)?")+"(\\.|$)"):null;for(n=0;n<r.length;n++)s=r[n],(e||k===s.origType)&&(!c||c.guid===s.guid)&&(!l||l.test(s.namespace))&&(!d||d===s.selector||d==="**"&&s.selector)&&(r.splice(n--,1),s.selector&&r.delegateCount--,p.remove&&p.remove.call(a,s));r.length===0&&m!==r.length&&((!p.teardown||p.teardown.call(a,l)===!1)&&f.removeEvent(a,j,g.handle),delete o[j])}f.isEmptyObject(o)&&(q=g.handle,q&&(q.elem=null),f.removeData(a,["events","handle"],!0))}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){if(!e||e.nodeType!==3&&e.nodeType!==8){var h=c.type||c,i=[],j,k,l,m,n,o,p,q,r,s;if(E.test(h+f.event.triggered))return;h.indexOf("!")>=0&&(h=h.slice(0,-1),k=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if((!e||f.event.customEvent[h])&&!f.event.global[h])return;c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.isTrigger=!0,c.exclusive=k,c.namespace=i.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)"):null,o=h.indexOf(":")<0?"on"+h:"";if(!e){j=f.cache;for(l in j)j[l].events&&j[l].events[h]&&f.event.trigger(c,d,j[l].handle.elem,!0);return}c.result=b,c.target||(c.target=e),d=d!=null?f.makeArray(d):[],d.unshift(c),p=f.event.special[h]||{};if(p.trigger&&p.trigger.apply(e,d)===!1)return;r=[[e,p.bindType||h]];if(!g&&!p.noBubble&&!f.isWindow(e)){s=p.delegateType||h,m=E.test(s+h)?e:e.parentNode,n=null;for(;m;m=m.parentNode)r.push([m,s]),n=m;n&&n===e.ownerDocument&&r.push([n.defaultView||n.parentWindow||a,s])}for(l=0;l<r.length&&!c.isPropagationStopped();l++)m=r[l][0],c.type=r[l][1],q=(f._data(m,"events")||{})[c.type]&&f._data(m,"handle"),q&&q.apply(m,d),q=o&&m[o],q&&f.acceptData(m)&&q.apply(m,d)===!1&&c.preventDefault();c.type=h,!g&&!c.isDefaultPrevented()&&(!p._default||p._default.apply(e.ownerDocument,d)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)&&o&&e[h]&&(h!=="focus"&&h!=="blur"||c.target.offsetWidth!==0)&&!f.isWindow(e)&&(n=e[o],n&&(e[o]=null),f.event.triggered=h,e[h](),f.event.triggered=b,n&&(e[o]=n));return c.result}},dispatch:function(c){c=f.event.fix(c||a.event);var d=(f._data(this,"events")||{})[c.type]||[],e=d.delegateCount,g=[].slice.call(arguments,0),h=!c.exclusive&&!c.namespace,i=[],j,k,l,m,n,o,p,q,r,s,t;g[0]=c,c.delegateTarget=this;if(e&&!c.target.disabled&&(!c.button||c.type!=="click")){m=f(this),m.context=this.ownerDocument||this;for(l=c.target;l!=this;l=l.parentNode||this){o={},q=[],m[0]=l;for(j=0;j<e;j++)r=d[j],s=r.selector,o[s]===b&&(o[s]=r.quick?H(l,r.quick):m.is(s)),o[s]&&q.push(r);q.length&&i.push({elem:l,matches:q})}}d.length>e&&i.push({elem:this,matches:d.slice(e)});for(j=0;j<i.length&&!c.isPropagationStopped();j++){p=i[j],c.currentTarget=p.elem;for(k=0;k<p.matches.length&&!c.isImmediatePropagationStopped();k++){r=p.matches[k];if(h||!c.namespace&&!r.namespace||c.namespace_re&&c.namespace_re.test(r.namespace))c.data=r.data,c.handleObj=r,n=((f.event.special[r.origType]||{}).handle||r.handler).apply(p.elem,g),n!==b&&(c.result=n,n===!1&&(c.preventDefault(),c.stopPropagation()))}}return c.result},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode);return a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,d){var e,f,g,h=d.button,i=d.fromElement;a.pageX==null&&d.clientX!=null&&(e=a.target.ownerDocument||c,f=e.documentElement,g=e.body,a.pageX=d.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=d.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?d.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0);return a}},fix:function(a){if(a[f.expando])return a;var d,e,g=a,h=f.event.fixHooks[a.type]||{},i=h.props?this.props.concat(h.props):this.props;a=f.Event(g);for(d=i.length;d;)e=i[--d],a[e]=g[e];a.target||(a.target=g.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey===b&&(a.metaKey=a.ctrlKey);return h.filter?h.filter(a,g):a},special:{ready:{setup:f.bindReady},load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=f.extend(new f.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?f.event.trigger(e,null,b):f.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},f.event.handle=f.event.dispatch,f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!(this instanceof f.Event))return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?K:J):this.type=a,b&&f.extend(this,b),this.timeStamp=a&&a.timeStamp||f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=K;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=K;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=K,this.stopPropagation()},isDefaultPrevented:J,isPropagationStopped:J,isImmediatePropagationStopped:J},f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c=this,d=a.relatedTarget,e=a.handleObj,g=e.selector,h;if(!d||d!==c&&!f.contains(c,d))a.type=e.origType,h=e.handler.apply(this,arguments),a.type=b;return h}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(){if(f.nodeName(this,"form"))return!1;f.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=f.nodeName(c,"input")||f.nodeName(c,"button")?c.form:b;d&&!d._submit_attached&&(f.event.add(d,"submit._submit",function(a){this.parentNode&&!a.isTrigger&&f.event.simulate("submit",this.parentNode,a,!0)}),d._submit_attached=!0)})},teardown:function(){if(f.nodeName(this,"form"))return!1;f.event.remove(this,"._submit")}}),f.support.changeBubbles||(f.event.special.change={setup:function(){if(z.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")f.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),f.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1,f.event.simulate("change",this,a,!0))});return!1}f.event.add(this,"beforeactivate._change",function(a){var b=a.target;z.test(b.nodeName)&&!b._change_attached&&(f.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&f.event.simulate("change",this.parentNode,a,!0)}),b._change_attached=!0)})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){f.event.remove(this,"._change");return z.test(this.nodeName)}}),f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){var d=0,e=function(a){f.event.simulate(b,a.target,f.event.fix(a),!0)};f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.fn.extend({on:function(a,c,d,e,g){var h,i;if(typeof a=="object"){typeof c!="string"&&(d=c,c=b);for(i in a)this.on(i,c,d,a[i],g);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=J;else if(!e)return this;g===1&&(h=e,e=function(a){f().off(a);return h.apply(this,arguments)},e.guid=h.guid||(h.guid=f.guid++));return this.each(function(){f.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on.call(this,a,b,c,d,1)},off:function(a,c,d){if(a&&a.preventDefault&&a.handleObj){var e=a.handleObj;f(a.delegateTarget).off(e.namespace?e.type+"."+e.namespace:e.type,e.selector,e.handler);return this}if(typeof a=="object"){for(var g in a)this.off(g,c,a[g]);return this}if(c===!1||typeof c=="function")d=c,c=b;d===!1&&(d=J);return this.each(function(){f.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){f(this.context).on(a,this.selector,b,c);return this},die:function(a,b){f(this.context).off(a,this.selector||"**",b);return this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length==1?this.off(a,"**"):this.off(b,a,c)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f._data(this,"lastToggle"+a.guid)||0)%d;f._data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.on(b,null,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0),C.test(b)&&(f.event.fixHooks[b]=f.event.keyHooks),D.test(b)&&(f.event.fixHooks[b]=f.event.mouseHooks)}),function(){function x(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}if(j.nodeType===1){g||(j[d]=c,j.sizset=h);if(typeof b!="string"){if(j===b){k=!0;break}}else if(m.filter(b,[j]).length>0){k=j;break}}j=j[a]}e[h]=k}}}function w(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}j.nodeType===1&&!g&&(j[d]=c,j.sizset=h);if(j.nodeName.toLowerCase()===b){k=j;break}j=j[a]}e[h]=k}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d="sizcache"+(Math.random()+"").replace(".",""),e=0,g=Object.prototype.toString,h=!1,i=!0,j=/\\/g,k=/\r\n/g,l=/\W/;[0,0].sort(function(){i=!1;return 0});var m=function(b,d,e,f){e=e||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return e;var i,j,k,l,n,q,r,t,u=!0,v=m.isXML(d),w=[],x=b;do{a.exec(""),i=a.exec(x);if(i){x=i[3],w.push(i[1]);if(i[2]){l=i[3];break}}}while(i);if(w.length>1&&p.exec(b))if(w.length===2&&o.relative[w[0]])j=y(w[0]+w[1],d,f);else{j=o.relative[w[0]]?[d]:m(w.shift(),d);while(w.length)b=w.shift(),o.relative[b]&&(b+=w.shift()),j=y(b,j,f)}else{!f&&w.length>1&&d.nodeType===9&&!v&&o.match.ID.test(w[0])&&!o.match.ID.test(w[w.length-1])&&(n=m.find(w.shift(),d,v),d=n.expr?m.filter(n.expr,n.set)[0]:n.set[0]);if(d){n=f?{expr:w.pop(),set:s(f)}:m.find(w.pop(),w.length===1&&(w[0]==="~"||w[0]==="+")&&d.parentNode?d.parentNode:d,v),j=n.expr?m.filter(n.expr,n.set):n.set,w.length>0?k=s(j):u=!1;while(w.length)q=w.pop(),r=q,o.relative[q]?r=w.pop():q="",r==null&&(r=d),o.relative[q](k,r,v)}else k=w=[]}k||(k=j),k||m.error(q||b);if(g.call(k)==="[object Array]")if(!u)e.push.apply(e,k);else if(d&&d.nodeType===1)for(t=0;k[t]!=null;t++)k[t]&&(k[t]===!0||k[t].nodeType===1&&m.contains(d,k[t]))&&e.push(j[t]);else for(t=0;k[t]!=null;t++)k[t]&&k[t].nodeType===1&&e.push(j[t]);else s(k,e);l&&(m(l,h,e,f),m.uniqueSort(e));return e};m.uniqueSort=function(a){if(u){h=i,a.sort(u);if(h)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},m.matches=function(a,b){return m(a,null,null,b)},m.matchesSelector=function(a,b){return m(b,null,null,[a]).length>0},m.find=function(a,b,c){var d,e,f,g,h,i;if(!a)return[];for(e=0,f=o.order.length;e<f;e++){h=o.order[e];if(g=o.leftMatch[h].exec(a)){i=g[1],g.splice(1,1);if(i.substr(i.length-1)!=="\\"){g[1]=(g[1]||"").replace(j,""),d=o.find[h](g,b,c);if(d!=null){a=a.replace(o.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},m.filter=function(a,c,d,e){var f,g,h,i,j,k,l,n,p,q=a,r=[],s=c,t=c&&c[0]&&m.isXML(c[0]);while(a&&c.length){for(h in o.filter)if((f=o.leftMatch[h].exec(a))!=null&&f[2]){k=o.filter[h],l=f[1],g=!1,f.splice(1,1);if(l.substr(l.length-1)==="\\")continue;s===r&&(r=[]);if(o.preFilter[h]){f=o.preFilter[h](f,s,d,r,e,t);if(!f)g=i=!0;else if(f===!0)continue}if(f)for(n=0;(j=s[n])!=null;n++)j&&(i=k(j,f,n,s),p=e^i,d&&i!=null?p?g=!0:s[n]=!1:p&&(r.push(j),g=!0));if(i!==b){d||(s=r),a=a.replace(o.match[h],"");if(!g)return[];break}}if(a===q)if(g==null)m.error(a);else break;q=a}return s},m.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)};var n=m.getText=function(a){var b,c,d=a.nodeType,e="";if(d){if(d===1||d===9){if(typeof a.textContent=="string")return a.textContent;if(typeof a.innerText=="string")return a.innerText.replace(k,"");for(a=a.firstChild;a;a=a.nextSibling)e+=n(a)}else if(d===3||d===4)return a.nodeValue}else for(b=0;c=a[b];b++)c.nodeType!==8&&(e+=n(c));return e},o=m.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!l.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&m.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!l.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&m.filter(b,a,!0)}},"":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("parentNode",b,f,a,d,c)},"~":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("previousSibling",b,f,a,d,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(j,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(j,"")},TAG:function(a,b){return a[1].replace(j,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||m.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&m.error(a[0]);a[0]=e++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(j,"");!f&&o.attrMap[g]&&(a[1]=o.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(j,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=m(b[3],null,null,c);else{var g=m.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(o.match.POS.test(b[0])||o.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!m(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=o.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||n([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}m.error(e)},CHILD:function(a,b){var c,e,f,g,h,i,j,k=b[1],l=a;switch(k){case"only":case"first":while(l=l.previousSibling)if(l.nodeType===1)return!1;if(k==="first")return!0;l=a;case"last":while(l=l.nextSibling)if(l.nodeType===1)return!1;return!0;case"nth":c=b[2],e=b[3];if(c===1&&e===0)return!0;f=b[0],g=a.parentNode;if(g&&(g[d]!==f||!a.nodeIndex)){i=0;for(l=g.firstChild;l;l=l.nextSibling)l.nodeType===1&&(l.nodeIndex=++i);g[d]=f}j=a.nodeIndex-e;return c===0?j===0:j%c===0&&j/c>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||!!a.nodeName&&a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=m.attr?m.attr(a,c):o.attrHandle[c]?o.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":!f&&m.attr?d!=null:f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=o.setFilters[e];if(f)return f(a,c,b,d)}}},p=o.match.POS,q=function(a,b){return"\\"+(b-0+1)};for(var r in o.match)o.match[r]=new RegExp(o.match[r].source+/(?![^\[]*\])(?![^\(]*\))/.source),o.leftMatch[r]=new RegExp(/(^(?:.|\r|\n)*?)/.source+o.match[r].source.replace(/\\(\d+)/g,q));var s=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(t){s=function(a,b){var c=0,d=b||[];if(g.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var e=a.length;c<e;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var u,v;c.documentElement.compareDocumentPosition?u=function(a,b){if(a===b){h=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(u=function(a,b){if(a===b){h=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,i=b.parentNode,j=g;if(g===i)return v(a,b);if(!g)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return v(e[k],f[k]);return k===c?v(a,f[k],-1):v(e[k],b,1)},v=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(o.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},o.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(o.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(o.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=m,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){m=function(b,e,f,g){e=e||c;if(!g&&!m.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return s(e.getElementsByTagName(b),f);if(h[2]&&o.find.CLASS&&e.getElementsByClassName)return s(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return s([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return s([],f);if(i.id===h[3])return s([i],f)}try{return s(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var k=e,l=e.getAttribute("id"),n=l||d,p=e.parentNode,q=/^\s*[+~]/.test(b);l?n=n.replace(/'/g,"\\$&"):e.setAttribute("id",n),q&&p&&(e=e.parentNode);try{if(!q||p)return s(e.querySelectorAll("[id='"+n+"'] "+b),f)}catch(r){}finally{l||k.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)m[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}m.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!m.isXML(a))try{if(e||!o.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return m(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;o.order.splice(1,0,"CLASS"),o.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?m.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?m.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:m.contains=function(){return!1},m.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var y=function(a,b,c){var d,e=[],f="",g=b.nodeType?[b]:b;while(d=o.match.PSEUDO.exec(a))f+=d[0],a=a.replace(o.match.PSEUDO,"");a=o.relative[a]?a+"*":a;for(var h=0,i=g.length;h<i;h++)m(a,g[h],e,c);return m.filter(f,e)};m.attr=f.attr,m.selectors.attrMap={},f.find=m,f.expr=m.selectors,f.expr[":"]=f.expr.filters,f.unique=m.uniqueSort,f.text=m.getText,f.isXMLDoc=m.isXML,f.contains=m.contains}();var L=/Until$/,M=/^(?:parents|prevUntil|prevAll)/,N=/,/,O=/^.[^:#\[\.,]*$/,P=Array.prototype.slice,Q=f.expr.match.POS,R={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(T(this,a,!1),"not",a)},filter:function(a){return this.pushStack(T(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?Q.test(a)?f(a,this.context).index(this[0])>=0:f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h=1;while(g&&g.ownerDocument&&g!==b){for(d=0;d<a.length;d++)f(g).is(a[d])&&c.push({selector:a[d],elem:g,level:h});g=g.parentNode,h++}return c}var i=Q.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(i?i.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a)return this[0]&&this[0].parentNode?this.prevAll().length:-1;if(typeof a=="string")return f.inArray(this[0],f(a));return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(S(c[0])||S(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling(a.parentNode.firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c);L.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!R[a]?f.unique(e):e,(this.length>1||N.test(d))&&M.test(a)&&(e=e.reverse());return this.pushStack(e,a,P.call(arguments).join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var V="abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",W=/ jQuery\d+="(?:\d+|null)"/g,X=/^\s+/,Y=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,Z=/<([\w:]+)/,$=/<tbody/i,_=/<|&#?\w+;/,ba=/<(?:script|style)/i,bb=/<(?:script|object|embed|option|style)/i,bc=new RegExp("<(?:"+V+")","i"),bd=/checked\s*(?:[^=]|=\s*.checked.)/i,be=/\/(java|ecma)script/i,bf=/^\s*<!(?:\[CDATA\[|\-\-)/,bg={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bh=U(c);bg.optgroup=bg.option,bg.tbody=bg.tfoot=bg.colgroup=bg.caption=bg.thead,bg.th=bg.td,f.support.htmlSerialize||(bg._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){if(f.isFunction(a))return this.each(function(b){var c=f(this);c.text(a.call(this,b,c.text()))});if(typeof a!="object"&&a!==b)return this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a));return f.text(this)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=f.isFunction(a);return this.each(function(c){f(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f.clean(arguments);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,f.clean(arguments));return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function()
{for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){if(a===b)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(W,""):null;if(typeof a=="string"&&!ba.test(a)&&(f.support.leadingWhitespace||!X.test(a))&&!bg[(Z.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Y,"<$1></$2>");try{for(var c=0,d=this.length;c<d;c++)this[c].nodeType===1&&(f.cleanData(this[c].getElementsByTagName("*")),this[c].innerHTML=a)}catch(e){this.empty().append(a)}}else f.isFunction(a)?this.each(function(b){var c=f(this);c.html(a.call(this,b,c.html()))}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bd.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bi(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,bp)}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i,j=a[0];b&&b[0]&&(i=b[0].ownerDocument||b[0]),i.createDocumentFragment||(i=c),a.length===1&&typeof j=="string"&&j.length<512&&i===c&&j.charAt(0)==="<"&&!bb.test(j)&&(f.support.checkClone||!bd.test(j))&&(f.support.html5Clone||!bc.test(j))&&(g=!0,h=f.fragments[j],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean(a,i,e,d)),g&&(f.fragments[j]=h?e:1);return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d,e,g,h=f.support.html5Clone||!bc.test("<"+a.nodeName)?a.cloneNode(!0):bo(a);if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bk(a,h),d=bl(a),e=bl(h);for(g=0;d[g];++g)e[g]&&bk(d[g],e[g])}if(b){bj(a,h);if(c){d=bl(a),e=bl(h);for(g=0;d[g];++g)bj(d[g],e[g])}}d=e=null;return h},clean:function(a,b,d,e){var g;b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||b[0]&&b[0].ownerDocument||c);var h=[],i;for(var j=0,k;(k=a[j])!=null;j++){typeof k=="number"&&(k+="");if(!k)continue;if(typeof k=="string")if(!_.test(k))k=b.createTextNode(k);else{k=k.replace(Y,"<$1></$2>");var l=(Z.exec(k)||["",""])[1].toLowerCase(),m=bg[l]||bg._default,n=m[0],o=b.createElement("div");b===c?bh.appendChild(o):U(b).appendChild(o),o.innerHTML=m[1]+k+m[2];while(n--)o=o.lastChild;if(!f.support.tbody){var p=$.test(k),q=l==="table"&&!p?o.firstChild&&o.firstChild.childNodes:m[1]==="<table>"&&!p?o.childNodes:[];for(i=q.length-1;i>=0;--i)f.nodeName(q[i],"tbody")&&!q[i].childNodes.length&&q[i].parentNode.removeChild(q[i])}!f.support.leadingWhitespace&&X.test(k)&&o.insertBefore(b.createTextNode(X.exec(k)[0]),o.firstChild),k=o.childNodes}var r;if(!f.support.appendChecked)if(k[0]&&typeof (r=k.length)=="number")for(i=0;i<r;i++)bn(k[i]);else bn(k);k.nodeType?h.push(k):h=f.merge(h,k)}if(d){g=function(a){return!a.type||be.test(a.type)};for(j=0;h[j];j++)if(e&&f.nodeName(h[j],"script")&&(!h[j].type||h[j].type.toLowerCase()==="text/javascript"))e.push(h[j].parentNode?h[j].parentNode.removeChild(h[j]):h[j]);else{if(h[j].nodeType===1){var s=f.grep(h[j].getElementsByTagName("script"),g);h.splice.apply(h,[j+1,0].concat(s))}d.appendChild(h[j])}}return h},cleanData:function(a){var b,c,d=f.cache,e=f.event.special,g=f.support.deleteExpando;for(var h=0,i;(i=a[h])!=null;h++){if(i.nodeName&&f.noData[i.nodeName.toLowerCase()])continue;c=i[f.expando];if(c){b=d[c];if(b&&b.events){for(var j in b.events)e[j]?f.event.remove(i,j):f.removeEvent(i,j,b.handle);b.handle&&(b.handle.elem=null)}g?delete i[f.expando]:i.removeAttribute&&i.removeAttribute(f.expando),delete d[c]}}}});var bq=/alpha\([^)]*\)/i,br=/opacity=([^)]*)/,bs=/([A-Z]|^ms)/g,bt=/^-?\d+(?:px)?$/i,bu=/^-?\d/,bv=/^([\-+])=([\-+.\de]+)/,bw={position:"absolute",visibility:"hidden",display:"block"},bx=["Left","Right"],by=["Top","Bottom"],bz,bA,bB;f.fn.css=function(a,c){if(arguments.length===2&&c===b)return this;return f.access(this,a,c,!0,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)})},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bz(a,"opacity","opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d,h==="string"&&(g=bv.exec(d))&&(d=+(g[1]+1)*+g[2]+parseFloat(f.css(a,c)),h="number");if(d==null||h==="number"&&isNaN(d))return;h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(bz)return bz(a,c)},swap:function(a,b,c){var d={};for(var e in b)d[e]=a.style[e],a.style[e]=b[e];c.call(a);for(e in b)a.style[e]=d[e]}}),f.curCSS=f.css,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){var e;if(c){if(a.offsetWidth!==0)return bC(a,b,d);f.swap(a,bw,function(){e=bC(a,b,d)});return e}},set:function(a,b){if(!bt.test(b))return b;b=parseFloat(b);if(b>=0)return b+"px"}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return br.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=f.isNumeric(b)?"alpha(opacity="+b*100+")":"",g=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&f.trim(g.replace(bq,""))===""){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bq.test(g)?g.replace(bq,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){var c;f.swap(a,{display:"inline-block"},function(){b?c=bz(a,"margin-right","marginRight"):c=a.style.marginRight});return c}})}),c.defaultView&&c.defaultView.getComputedStyle&&(bA=function(a,b){var c,d,e;b=b.replace(bs,"-$1").toLowerCase(),(d=a.ownerDocument.defaultView)&&(e=d.getComputedStyle(a,null))&&(c=e.getPropertyValue(b),c===""&&!f.contains(a.ownerDocument.documentElement,a)&&(c=f.style(a,b)));return c}),c.documentElement.currentStyle&&(bB=function(a,b){var c,d,e,f=a.currentStyle&&a.currentStyle[b],g=a.style;f===null&&g&&(e=g[b])&&(f=e),!bt.test(f)&&bu.test(f)&&(c=g.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),g.left=b==="fontSize"?"1em":f||0,f=g.pixelLeft+"px",g.left=c,d&&(a.runtimeStyle.left=d));return f===""?"auto":f}),bz=bA||bB,f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style&&a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)});var bD=/%20/g,bE=/\[\]$/,bF=/\r?\n/g,bG=/#.*$/,bH=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bI=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bJ=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,bK=/^(?:GET|HEAD)$/,bL=/^\/\//,bM=/\?/,bN=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bO=/^(?:select|textarea)/i,bP=/\s+/,bQ=/([?&])_=[^&]*/,bR=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bS=f.fn.load,bT={},bU={},bV,bW,bX=["*/"]+["*"];try{bV=e.href}catch(bY){bV=c.createElement("a"),bV.href="",bV=bV.href}bW=bR.exec(bV.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bS)return bS.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bN,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bO.test(this.nodeName)||bI.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bF,"\r\n")}}):{name:b.name,value:c.replace(bF,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.on(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?b_(a,f.ajaxSettings):(b=a,a=f.ajaxSettings),b_(a,b);return a},ajaxSettings:{url:bV,isLocal:bJ.test(bW[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":bX},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:bZ(bT),ajaxTransport:bZ(bU),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a>0?4:0;var o,r,u,w=c,x=l?cb(d,v,l):b,y,z;if(a>=200&&a<300||a===304){if(d.ifModified){if(y=v.getResponseHeader("Last-Modified"))f.lastModified[k]=y;if(z=v.getResponseHeader("Etag"))f.etag[k]=z}if(a===304)w="notmodified",o=!0;else try{r=cc(d,x),w="success",o=!0}catch(A){w="parsererror",u=A}}else{u=w;if(!w||a)w="error",a<0&&(a=0)}v.status=a,v.statusText=""+(c||w),o?h.resolveWith(e,[r,w,v]):h.rejectWith(e,[v,w,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.fireWith(e,[v,w]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f.Callbacks("once memory"),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bH.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.add,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bG,"").replace(bL,bW[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bP),d.crossDomain==null&&(r=bR.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bW[1]&&r[2]==bW[2]&&(r[3]||(r[1]==="http:"?80:443))==(bW[3]||(bW[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),b$(bT,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bK.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bM.test(d.url)?"&":"?")+d.data,delete d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bQ,"$1_="+x);d.url=y+(y===d.url?(bM.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", "+bX+"; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=b$(bU,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){if(s<2)w(-1,z);else throw z}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)ca(g,a[g],c,e);return d.join("&").replace(bD,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var cd=f.now(),ce=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+cd++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=b.contentType==="application/x-www-form-urlencoded"&&typeof b.data=="string";if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(ce.test(b.url)||e&&ce.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(ce,l),b.url===j&&(e&&(k=k.replace(ce,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var cf=a.ActiveXObject?function(){for(var a in ch)ch[a](0,1)}:!1,cg=0,ch;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ci()||cj()}:ci,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,cf&&delete ch[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n),m.text=h.responseText;try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++cg,cf&&(ch||(ch={},f(a).unload(cf)),ch[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var ck={},cl,cm,cn=/^(?:toggle|show|hide)$/,co=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,cp,cq=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],cr;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(cu("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),e===""&&f.css(d,"display")==="none"&&f._data(d,"olddisplay",cv(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(cu("hide",3),a,b,c);var d,e,g=0,h=this.length;for(;g<h;g++)d=this[g],d.style&&(e=f.css(d,"display"),e!=="none"&&!f._data(d,"olddisplay")&&f._data(d,"olddisplay",e));for(g=0;g<h;g++)this[g].style&&(this[g].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(cu("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){function g(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]),h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(!f.support.inlineBlockNeedsLayout||cv(this.nodeName)==="inline"?this.style.display="inline-block":this.style.zoom=1))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)j=new f.fx(this,b,i),h=a[i],cn.test(h)?(o=f._data(this,"toggle"+i)||(h==="toggle"?d?"show":"hide":0),o?(f._data(this,"toggle"+i,o==="show"?"hide":"show"),j[o]()):j[h]()):(k=co.exec(h),l=j.cur(),k?(m=parseFloat(k[2]),n=k[3]||(f.cssNumber[i]?"":"px"),n!=="px"&&(f.style(this,i,(m||1)+n),l=(m||1)/j.cur()*l,f.style(this,i,l+n)),k[1]&&(m=(k[1]==="-="?-1:1)*m+l),j.custom(l,m,n)):j.custom(l,h,""));return!0}var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return e.queue===!1?this.each(g):this.queue(e.queue,g)},stop:function(a,c,d){typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]);return this.each(function(){function h(a,b,c){var e=b[c];f.removeData(a,c,!0),e.stop(d)}var b,c=!1,e=f.timers,g=f._data(this);d||f._unmark(!0,this);if(a==null)for(b in g)g[b]&&g[b].stop&&b.indexOf(".run")===b.length-4&&h(this,g,b);else g[b=a+".run"]&&g[b].stop&&h(this,g,b);for(b=e.length;b--;)e[b].elem===this&&(a==null||e[b].queue===a)&&(d?e[b](!0):e[b].saveState(),c=!0,e.splice(b,1));(!d||!c)&&f.dequeue(this,a)})}}),f.each({slideDown:cu("show",1),slideUp:cu("hide",1),slideToggle:cu("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";d.old=d.complete,d.complete=function(a){f.isFunction(d.old)&&d.old.call(this),d.queue?f.dequeue(this,d.queue):a!==!1&&f._unmark(this)};return d},easing:{linear:function(a,b,c,d){return c+d*a},swing:function(a,b,c,d){return(-Math.cos(a*Math.PI)/2+.5)*d+c}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,c,d){function h(a){return e.step(a)}var e=this,g=f.fx;this.startTime=cr||cs(),this.end=c,this.now=this.start=a,this.pos=this.state=0,this.unit=d||this.unit||(f.cssNumber[this.prop]?"":"px"),h.queue=this.options.queue,h.elem=this.elem,h.saveState=function(){e.options.hide&&f._data(e.elem,"fxshow"+e.prop)===b&&f._data(e.elem,"fxshow"+e.prop,e.start)},h()&&f.timers.push(h)&&!cp&&(cp=setInterval(g.tick,g.interval))},show:function(){var a=f._data(this.elem,"fxshow"+this.prop);this.options.orig[this.prop]=a||f.style(this.elem,this.prop),this.options.show=!0,a!==b?this.custom(this.cur(),a):this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f._data(this.elem,"fxshow"+this.prop)||f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b,c,d,e=cr||cs(),g=!0,h=this.elem,i=this.options;if(a||e>=i.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),i.animatedProperties[this.prop]=!0;for(b in i.animatedProperties)i.animatedProperties[b]!==!0&&(g=!1);if(g){i.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){h.style["overflow"+b]=i.overflow[a]}),i.hide&&f(h).hide();if(i.hide||i.show)for(b in i.animatedProperties)f.style(h,b,i.orig[b]),f.removeData(h,"fxshow"+b,!0),f.removeData(h,"toggle"+b,!0);d=i.complete,d&&(i.complete=!1,d.call(h))}return!1}i.duration==Infinity?this.now=e:(c=e-this.startTime,this.state=c/i.duration,this.pos=f.easing[i.animatedProperties[this.prop]](this.state,c,0,1,i.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){var a,b=f.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||f.fx.stop()},interval:13,stop:function(){clearInterval(cp),cp=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=a.now+a.unit:a.elem[a.prop]=a.now}}}),f.each(["width","height"],function(a,b){f.fx.step[b]=function(a){f.style(a.elem,b,Math.max(0,a.now)+a.unit)}}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cw=/^t(?:able|d|h)$/i,cx=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?f.fn.offset=function(a){var b=this[0],c;if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);try{c=b.getBoundingClientRect()}catch(d){}var e=b.ownerDocument,g=e.documentElement;if(!c||!f.contains(g,b))return c?{top:c.top,left:c.left}:{top:0,left:0};var h=e.body,i=cy(e),j=g.clientTop||h.clientTop||0,k=g.clientLeft||h.clientLeft||0,l=i.pageYOffset||f.support.boxModel&&g.scrollTop||h.scrollTop,m=i.pageXOffset||f.support.boxModel&&g.scrollLeft||h.scrollLeft,n=c.top+l-j,o=c.left+m-k;return{top:n,left:o}}:f.fn.offset=function(a){var b=this[0];if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);var c,d=b.offsetParent,e=b,g=b.ownerDocument,h=g.documentElement,i=g.body,j=g.defaultView,k=j?j.getComputedStyle(b,null):b.currentStyle,l=b.offsetTop,m=b.offsetLeft;while((b=b.parentNode)&&b!==i&&b!==h){if(f.support.fixedPosition&&k.position==="fixed")break;c=j?j.getComputedStyle(b,null):b.currentStyle,l-=b.scrollTop,m-=b.scrollLeft,b===d&&(l+=b.offsetTop,m+=b.offsetLeft,f.support.doesNotAddBorder&&(!f.support.doesAddBorderForTableAndCells||!cw.test(b.nodeName))&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),e=d,d=b.offsetParent),f.support.subtractsBorderForOverflowNotVisible&&c.overflow!=="visible"&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),k=c}if(k.position==="relative"||k.position==="static")l+=i.offsetTop,m+=i.offsetLeft;f.support.fixedPosition&&k.position==="fixed"&&(l+=Math.max(h.scrollTop,i.scrollTop),m+=Math.max(h.scrollLeft,i.scrollLeft));return{top:l,left:m}},f.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=cx.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!cx.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each(["Left","Top"],function(a,c){var d="scroll"+c;f.fn[d]=function(c){var e,g;if(c===b){e=this[0];if(!e)return null;g=cy(e);return g?"pageXOffset"in g?g[a?"pageYOffset":"pageXOffset"]:f.support.boxModel&&g.document.documentElement[d]||g.document.body[d]:e[d]}return this.each(function(){g=cy(this),g?g.scrollTo(a?f(g).scrollLeft():c,a?c:f(g).scrollTop()):this[d]=c})}}),f.each(["Height","Width"],function(a,c){var d=c.toLowerCase();f.fn["inner"+c]=function(){var a=this[0];return a?a.style?parseFloat(f.css(a,d,"padding")):this[d]():null},f.fn["outer"+c]=function(a){var b=this[0];return b?b.style?parseFloat(f.css(b,d,a?"margin":"border")):this[d]():null},f.fn[d]=function(a){var e=this[0];if(!e)return a==null?null:this;if(f.isFunction(a))return this.each(function(b){var c=f(this);c[d](a.call(this,b,c[d]()))});if(f.isWindow(e)){var g=e.document.documentElement["client"+c],h=e.document.body;return e.document.compatMode==="CSS1Compat"&&g||h&&h["client"+c]||g}if(e.nodeType===9)return Math.max(e.documentElement["client"+c],e.body["scroll"+c],e.documentElement["scroll"+c],e.body["offset"+c],e.documentElement["offset"+c]);if(a===b){var i=f.css(e,d),j=parseFloat(i);return f.isNumeric(j)?j:i}return this.css(d,typeof a=="string"?a:a+"px")}}),a.jQuery=a.$=f,typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return f})})(window);
var global = {};
(function() {
	
	var log = function() {
		var numOfArguments = arguments.length;
		for(var i=0; i<numOfArguments; i++) {
			console.log(arguments[i]);
		};
	};
	
	global.debug = function(message) {
		message = "---------------> " + message;
		console.log(message);
		this.log = log;
		return this;
	};
	
})();
(function() {
    global.fabrico = function() {
        
        var modules = {};
        
        var run = function() {
            global.debug("fabrico").log("run");
        };
        
        return {
            modules: modules,
            run: run
        };
        
    }();
})();
(function() {
    global.fabrico.modules.presenters = function() {
        
        var get = function(presenterPath) {
            var presenterNameParts = presenterPath.split("/");
            var presenter = global.fabrico.modules.presenters[presenterNameParts[presenterNameParts.length-1].replace(".php", "")];
            if(presenter) {
                return presenter;
            } else {
                return null;
            }
        };
        
        return {
            get: get
        }
        
    }();
})();
(function() {
    global.fabrico.modules.areYouSure = function() {
        
        var question = "Are you sure!";
        
        var forward = function(url) {
            if(confirm(question)) {
                window.location.href = url;
            }
        };
        var callback = function(callback) {
            if(confirm(question)) {
                callback();
            }
        };
        
        return {
            forward: forward,
            callback: callback
        };
        
    }();
})();
(function() {
    global.fabrico.modules.presenters.Color = function() {
        
        var dependencyHide = function(field) {
            
        };
        var dependencyShow = function(field) {
            var item = $('[name=' + field.name + ']');
            $(".color-" + field.name).val("FFFFFF");
            jscolor.bind();
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();
(function() {
    global.fabrico.modules.presenters.Date = function() {
        
        var dependencyHide = function(field) {
        };
        var dependencyShow = function(field) {
            if(global.fabrico.modules.presenters.Date["init" + field.name]) {
                var item = $('[name=' + field.name + ']');
                global.fabrico.modules.presenters.Date["init" + field.name]();
                item.val(global.fabrico.modules.presenters.currentDate);                
            }
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();
(function() {
    global.fabrico.modules.presenters.Dependencies = function() {
        
        var fields = [];
        
        var dependencyHide = function(fieldName) {
            var item = $('[name=' + fieldName + ']');
            var clone = item.clone(false, false);
            clone.val("");
            item.replaceWith(clone);
            setItemEvents(clone);
        };
        var setHiddenFieldValue = function(fieldName, value) {
            var hidden = $('[name=' + fieldName + '_hidden]');
            if(hidden.length == 0) {
                var form = $('form');
                hidden = $('<input type="hidden" name="' + fieldName + '_hidden" value="' + value + '" />');
                form.append(hidden);
            } else {
                hidden.val(value);
            }
        };
        var evaluate = function(dependency) {
            var result = null;
            if($.isArray(dependency)) {
                var numOfDependencies = dependency.length;
                for(var i=0; i<numOfDependencies; i++) {
                    var res = evaluate(dependency[i]);
                    var isArray = $.isArray(dependency[i]);
                    if(result === null) {
                        result = res;
                    } else {
                        result = isArray ? result || res : result && res;
                    }
                }
            } else {
                var item = $('[name=' + dependency.field + ']');
                var regexp = new RegExp(dependency.shouldMatch, "gi");
                var value = item.val();
                if(item.attr("type") == "radio") {
                    value = $('input:radio[name=' + dependency.field + ']:checked').val();
                }
                result = regexp.test(value);
            }
            return result;
        };
        var onPresenterChange = function() {
            var numOfFields = fields ? fields.length : 0;
            for(var i=0; i<numOfFields; i++) {
                var field = fields[i];
                if(field.dependencies) {
                    var passDependencies = evaluate(field.dependencies);
                    var presenter = global.fabrico.modules.presenters.get(field.presenter);
                    if(passDependencies) {
                        $("#" + field.name + "-row").css("display", "table-row");
                        if(presenter && presenter.dependencyShow) {
                            presenter.dependencyShow(field);
                        }
                        setHiddenFieldValue(field.name, "no");
                    } else {
                        $("#" + field.name + "-row").css("display", "none");
                        if(presenter && presenter.dependencyHide) {
                            presenter.dependencyHide(field);
                        } else {
                            dependencyHide(field.name);
                        }
                        setHiddenFieldValue(field.name, "yes");
                    }
                }
            }
            return;
        };
        var setItemEvents = function(item) {
            item.change(function() {
                onPresenterChange();
            });
        };
        var config = function(allFields) {
            // global.debug("Dependencies fields=").log(allFields);
            fields = allFields;
            var numOfFields = fields ? fields.length : 0;
            for(var i=0; i<numOfFields; i++) {
                var field = fields[i];
                var fieldName = field.name;
                var item = $('[name=' + fieldName + ']');
                if(item.length > 0) {
                    (function(item, fieldName) {
                        setItemEvents(item);
                        onPresenterChange();
                    })(item, fieldName);
                }
            }
        };
        
        return {
            config: config
        };
        
    }();
})();
(function() {
    global.fabrico.modules.presenters.Files = function() {
        
        var input = null;
        var numOfFields = 0;
        var formField = "";
        
        var updateNumOfFields = function() {
            $('input[name*="' + formField + '_numOfFields"]').val(numOfFields);
        };
        var addInput = function(field) {
            global.debug("presenters.Files").log("addInput field=" + field);
            formField = field;
            if(!input) {
                input = $("#filesInputHolder > .filesInputHolderItem").clone();
            }
            var newInput = input.clone();
            newInput.attr("class", formField + "_" + numOfFields + "_row");
            newInput.find("input").attr("name", formField + "_" + numOfFields);
            newInput.find(".remove").css("display", "inline");
            newInput.find(".remove").attr("href", "javascript:global.fabrico.modules.presenters.Files.removeInput('" + formField + "_" + numOfFields + "_row');");
            $("#filesInputHolder").append(newInput);
            numOfFields += 1;
            updateNumOfFields();
        };
        var removeInput = function(field) {
            $("." + field).remove();
        };
        var removeFile = function(field, linkId) {
            global.fabrico.modules.areYouSure.callback(function() {
               $("#" + linkId).parent().css("display", "none");
               var value = $('input[name*="' + field + '_filesToRemove"]').val();
               $('input[name*="' + field + '_filesToRemove"]').val(value + "|" + linkId)
            });
        };
        var dependencyHide = function(field) {
            var numOfFieldsInput = $('[name=' + field.name + '_numOfFields]');
            if(numOfFieldsInput.length > 0) {
                var numOfFields = numOfFieldsInput.val();
                for(var i=0; i<numOfFields; i++) {
                    $("." + field.name + "_" + i + "_row").remove();
                }
            }
        };
        var dependencyShow = function(field) {
            
        };
        
        return {
            addInput: addInput,
            removeInput: removeInput,
            removeFile: removeFile,
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        };
        
    }();
})();
(function() {
    global.fabrico.modules.presenters.SelectCheck = function() {
        
        var dependencyHide = function(field) {
            var selector = 'input[name^="' + field.name + '_"]';
            var inputs = $(selector);
            if(inputs.length > 0) {
                var numOfInputs = inputs.length;
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    input.checked = false;
                    input.attr("checked", false);
                }
            }
            field.hidden = true;
        };
        var dependencyShow = function(field) {
            var selector = 'input[name^="' + field.name + '_"]';
            var inputs = $(selector);
            var numOfInputs = inputs.length;
            if(numOfInputs > 0) {
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    (function(input) {
                        if(field.defaultValue == input.val() && field.hidden) {
                            input.checked = true;
                            input.attr('checked', 'checked');
                        }
                    })(input);
                }
            }
            field.hidden = false;
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();
(function() {
    global.fabrico.modules.presenters.SelectRadio = function() {
        
        var dependencyHide = function(field) {
            var selector = 'input[name="' + field.name + '"]';
            var inputs = $(selector);
            var numOfInputs = inputs.length;
            if(numOfInputs > 0) {
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    input.checked = false;
                    input.removeAttr('checked');
                }
            }
            field.hidden = true;
        };
        var dependencyShow = function(field) {
            var selector = 'input[name="' + field.name + '"]';
            var inputs = $(selector);
            var numOfInputs = inputs.length;
            if(numOfInputs > 0) {
                for(var i=0; i<numOfInputs; i++) {
                    var input = inputs.eq(i);
                    (function(input) {
                        if(field.defaultValue == input.val() && field.hidden) {
                            input.checked = true;
                            input.attr('checked', 'checked');
                        }
                    })(input);
                }
            }
            field.hidden = false;
        };
        
        return {
            dependencyHide: dependencyHide,
            dependencyShow: dependencyShow
        }
        
    }();
})();
(function() {
    global.fabrico.modules.presenters.TextRich = function() {
        
        var defaultTexts = {};
        var settings = {};
        
        var register = function(field, defaultText, settingsParams) {
            defaultTexts[field] = defaultText;
            settings = settingsParams;
            var rand = Math.floor(Math.random()*1000000);
            var swf = new FlashObject(settings.swfURL + "?tmp=" + rand, field + "_swf", "100%", "400", "9", "#FFFFFF");
            swf.addParam("wmode", "opaque");
            swf.addVariable("field", field);
            for(var i in settings) {
                swf.addVariable(i, settings[i]);
            }
            window.onload = function() {
                swf.write(field + "_wysiwygHolder");
            }
        };
        var onTextChange = function(field, text) {
            $('input[name*="' + field + '"]').val(text);
        };
        var getDefaultText = function(field) {
            document.getElementById(field + "_swf").setText(defaultTexts[field]);
        }
        
        return {
            register: register,
            onTextChange: onTextChange,
            getDefaultText: getDefaultText
        }
        
    }();
})();
(function() {
    global.fabrico.modules.presenters.TextTinyMCE = function() {
        
        var isInit = false;
        
        var init = function(settings) {
            if(!isInit) {
                isInit = true;
                tinyMCE.init(settings);
            }
        };
        
        return {
            init: init
        }
        
    }();
})();
window.onload = function() {
    global.fabrico.run();
}

