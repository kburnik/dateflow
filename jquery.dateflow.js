/*

*******************************************************************************************

DateFlow - a jQuery plugin by Kristijan Burnik

*******************************************************************************************

*/

$.fn.extend({
	DF_showMarker:function(select) {
		if (select) {
			$(this).removeClass("deselecting").addClass("selecting");
		} else {
			$(this).removeClass("selecting").addClass("deselecting");
		}
		return $(this);
	},
	DF_setMarker:function(select,o,t){
		var markerData = o.markers[t.currentMarker];
		for (var x in o.markers) {
			if (x != t.currentMarker) $(this).attr('rel','').removeClass(o.markers[x].style);
		}
		if (select) {
			$(this).attr("rel",t.currentMarker).addClass(markerData.style);
		} else {
			$(this).attr("rel",'').removeClass(markerData.style);
		}
		return $(this);
	},
	DF_setSelected:function(select,o,t){
		var $objects = $(this);
		if (select) {
			$objects.addClass("selected");
		} else {
			$objects.removeClass("selected");
		}
		return $(this);
	},
	DF_rectangle:function($start,o) {
		var $end = $(this);

		var startCellIndex = $start.prevAll().length + $start.parent().prevAll(".DF_month").children(".DF_day").length;
		var endCellIndex = $end.prevAll().length + $end.parent().prevAll(".DF_month").children(".DF_day").length ;
	
		if (startCellIndex > endCellIndex) {
			var t = startCellIndex;
			startCellIndex = endCellIndex;
			endCellIndex = t;
		}

		var $objects = $start.parent().parent().find(".DF_day:gt("+(startCellIndex-1)+"):lt("+(endCellIndex - startCellIndex )+")");
		$objects = $objects.add($start).add($end);
		
		var $non_objects = $start.parent().parent().find(".DF_day:lt("+(startCellIndex-1)+")")
		$non_objects = $non_objects.add($start.parent().parent().find(".DF_day:gt("+(endCellIndex - startCellIndex )+")"));
		
		$non_objects.removeClass("selecting");
		

		return $objects;
		//
	},
	dateflow:function(options,param,param1,param2){
		
		if (typeof options == 'string') {
			var func = $(this)[0].__DF__[options];
			if (typeof func == 'function') return func(param,param1,param2);
			return null;
		}
		//
		
		var $container = $(this);
		
		var defaults = {
			isSelectable:true,
			markWeekends:true,
			markMondays:true,
			markers:{
				selected:{
					background:'black',
					color:"white"
				}
			},
			defaultMaker:"selected",
			allowMarkerSelection:true,
			simpleSelection:false,
			simpleSelectionAllowedMarkers:true, // all is allowed on simple selection // or object {marker1:true, marker2:false, ...}
			simpleSelectionAllowDispersive:true, // allow dispersive interval
			selected:{}, // list of dates grouped by markers
			range:{
				start:{year:2010,month:0}, // january
				end:{year:2011,month:11} // DECEMBER
			},
			onSelectStart:function($td){
			
			},
			onSelectEnd:function($td){
			
			},
			onSelect:function($td){
			
			},
			onSelectComplete:function(datesArray,currentMarker){
			
			},
			
			mouseover:function(){},
			mouseout:function(){},
			mousedown:function(){},
			mouseup:function(){},
			
			
		}
		
		var o = options;
			
		// overwrite defaults with chosen options
		if (typeof options == 'object') {
			if (!options) {
				options=defaults;
			} else {
				for (property in defaults) {
					if (options[property]==null) options[property]=defaults[property];
				}
			}
		} else {
			options = defaults;
		}
		//
		
		
		var zeroPrefix = function(number,digits) {
			if (typeof digits == 'undefined') digits = 2;
			while ( (digits - (number+'').length ) > 0) {
				number = '0' + number;
			}
			return number;
		}

		
		var montDiffInclusive = function(range) {
			return 1 + (range.end.year * 12 + range.end.month ) - (range.start.year * 12 + range.start.month );
		}
		
		var yearMarker = function(year) {
			return $("<tr>").append($("<td colspan='32' class='DF_year_marker'>").html(year));
		};
		
		
		var sortFunction = function(a,b){ return ($(a).attr("dayindex")*1 - $(b).attr("dayindex")*1); }
		
		
		var $simpleSelectStart = [], $simpleSelectEnd = [];
		var simpleSelectState = true;
		var simpleSelectFinish = function() {
			if ($simpleSelectEnd.length > 0 && $simpleSelectStart.length > 0) {
				var $selected = $simpleSelectEnd.DF_rectangle($simpleSelectStart,o);
				
				
				// filter out unAllowed markers
				var filter = o.simpleSelectionAllowedMarkers;
				if (typeof filter == 'object' ) {
					var filter = filter;
					$selected = $selected.filter(function(){
						return ( filter [ $(this).attr("rel") ] == true );								
					});
				}
				
				// filter out dispersive
				if (!o.simpleSelectionAllowDispersive) {
					var $objects = t.$container.find(".DF_day.selected");
					if ($selected.length > 0) $objects = $objects.add($selected);
					
					$objects = $objects.sort(sortFunction);
					var $last = $($objects[0]), steadyInterval = true;
					$objects = $objects.filter(function(){
						var ok = false;
						var indexDiff = Math.abs( $last.attr("dayindex") - $(this).attr("dayindex") );
						if ( steadyInterval && indexDiff <= 1 ) {
							var ok = true;
						} else {
							ok = steadyInterval = false;
						}
						
						$last = $(this);
						return ok;
					});
					
					if (!steadyInterval) {
						t.$container.find(".DF_day.selected").removeClass("selected");
					}
				}
				
				$selected.DF_setSelected(simpleSelectState,o,t); 
				
				if (!o.simpleSelectionAllowDispersive) {
					$selected = t.$container.find(".DF_day.selected").sort(sortFunction);
					var $last = $($selected[0]), steadyInterval = true;
					$unwanted = $selected.filter(function(){
						var ok = false;
						var indexDiff = Math.abs( $last.attr("dayindex") - $(this).attr("dayindex") );
						if ( steadyInterval && indexDiff <= 1 ) {
							var ok = true;
						} else {
							ok = steadyInterval = false;
						}
						
						$last = $(this);
						return !ok;
					});
					$unwanted.removeClass("selected");
				}
				
				
				t.$container.find(".DF_day").removeClass("selecting").removeClass("deselecting");
				
				
				
				
				o.onSelectComplete(t.selectedDates(false,true),false);
			}
			$simpleSelectStart = $simpleSelectEnd = [];
		}
		
		
		
		var $markStart = [],$markEnd = [];
		var markState = true;
		var markFinish = function(){
			if ($markEnd.length > 0 && $markStart.length > 0) {
				$markEnd.DF_rectangle($markStart).DF_setMarker(markState,o,t);
				t.$container.find(".DF_day").removeClass("selecting").removeClass("deselecting");
				o.onSelectComplete(t.selectedDates(),t.currentMarker);
			}
			$markStart = $markEnd = []
		}
	
		$(document).mouseup(function(){
				if (o.isSelectable) {	
					if (o.simpleSelection) {
						simpleSelectFinish();
					} else {
						markFinish();
					}
				}
				
		});
	

		var t = {
			currentMarker:o.defaultMaker,
			$container:$container,
			now:'',
			syncTime:function(dateTime){
				
			},
			update:function(option,value,skipReconstruct){
				o[option] = value;
				if (skipReconstruct)  return true
				t.reconstruct();
				return true;
			},
			simpleselect:function(dateList){
				t.$container.find(".DF_day").removeClass("selected");
				if (typeof dateList != 'undefined' && dateList.length > 0) {
					var $out = $([]);
					for (var date in dateList) {
						$out = $out.add (
							t.$container.find(".DF_day[title="+dateList[date]+"]").filter(function(){
								return (o.simpleSelectionAllowedMarkers==true || o.simpleSelectionAllowedMarkers[$(this).attr("rel")] == true)
							}).addClass("selected")
						);
					}
					return $out;
				} else {
					return [];
				}
			},
			select:function(dateList,marker) {
				var cMarker = t.currentMarker;
				if (typeof marker != 'undefined') {
					t.currentMarker = marker;
				}
				if (typeof dateList == 'undefined') {
					t.$container.find(".DF_day").attr("rel",t.currentMarker);
				} else if (typeof dateList == 'object') {
					if (dateList.hasOwnProperty("length")) {
						for (var date in dateList) {
							t.$container.find(".DF_day[title="+dateList[date]+"]").DF_setMarker(true,o,t);
						}
					} else {
						for (var x in dateList) {
							t.currentMarker = x;
							t.select(dateList[x]);
						}
						
					}
				}
				t.currentMarker = cMarker;
				return t.selected();
			},
			deselect:function(dateList) {
				var cMarker = t.currentMarker;
				if (typeof marker != 'undefined') {
					t.currentMarker = marker;
				}
				if (typeof dateList == 'undefined') {
					t.$container.find(".DF_day").DF_setMarker(false,o,t);
				} else if (typeof dateList == 'object') {
					if (dateList.hasOwnProperty("length")) {
						for (var date in dateList) {
							t.$container.find(".DF_day[title="+dateList[date]+"]").DF_setMarker(false,o,t);
						}
					} else {
						for (var x in dateList) {
							t.currentMarker = x;
							t.select(dateList[x]);
						}
					}
				}
				t.currentMarker = cMarker;
				return t.selected();
			},
			selected:function(marker,simple){
				if (simple) {
					return t.$container.find(".DF_day.selected");
				} else {
					if (typeof marker == 'undefined') marker = t.currentMarker;
					return t.$container.find(".DF_day[rel="+marker+"]");
				}
			},
			
			selectedDates:function(marker,simple){
				var dates = [];
				t.selected(marker,simple).each(function(){
					dates.push ( $(this).attr("title") );
				});
				return dates;
			},
			selectedDatesByMarkers:function(){
				var groups = {};
				for (var x in o.markers) {
					groups[x] = t.selectedDates(x);
				}
				return groups;
			},
			render:function(range) {
				$(this).children().remove();
				var year = range.start.year;
				var month = range.start.month-1;
				
				var $table = $("<table class='DF_flow' cellpadding='0' cellspacing='1'>");
				var $tbody = $("<tbody>").appendTo($table);
				var totalMonts = montDiffInclusive(range);
				
				var firstDayDate = new Date(year,month,0);
				var dayOfWeek = firstDayDate.getDay();
				
				var numWeek = 0 ;
				var dayIndex = 0;
				var firstYearMarkerAttached = false;
				
				while (totalMonts-- > 0) {
					if (month==0 || !firstYearMarkerAttached) { 
						$tbody.append(yearMarker(year));
						firstYearMarkerAttached = true;
					}
					
					// generate month
					var $tr = $("<tr class='DF_month'>");
					$tr.mouseenter(function(){
						$(this).addClass("hover");
					}).mouseleave(function(){
						$(this).removeClass("hover");
					});
					
					var $td = $("<td class='DF_month_marker'>").html(zeroPrefix(month+1,2));
					$td.click(function(){
						$(this).next().mousedown();
						$(this).nextAll(".DF_day:last").mouseover().mouseup().mouseout();
					}).appendTo($tr);
					
					numDays = daysInMonth(year,month);
					
					var $td = {};
					// iterate thru days
					for (var day = 0; day < numDays; day++) {
						
						$td = $("<td class='DF_day'>").html(zeroPrefix(day+1,2));
						$td.attr("dayindex",dayIndex++);
						
						var weekParityClass = (numWeek%2==0) ?  "DF_even_week" : "DF_odd_week" ;
						$td.addClass(weekParityClass);
						
						// MARK WEEKENDS
						if (o.markWeekends) {
							if (dayOfWeek in [0,6]) {
								$td.addClass("DF_weekend")
							}
						}
						
						// MARK MONDAYS
						if (o.markMondays) {
							if (dayOfWeek == 1) {
								$td.addClass("DF_monday");
							}
						}
						
						
						
						$td.attr("title",year+"-"+zeroPrefix(month+1,2)+"-"+zeroPrefix(day+1,2));
						
						$tr.append($td);
						
						$td.mouseover(function(){
							$(this).addClass("hover");
							// simple select
							if (o.simpleSelection) {
								$simpleSelectEnd = $(this);
								if ($simpleSelectStart.length > 0) {
									$(this).DF_rectangle($simpleSelectStart,o).DF_showMarker(simpleSelectState);
								}
								return true;
							}
							//
							
							// marker select
							if ( o.onSelect($(this)) !== false && o.isSelectable ) {
								$markEnd = $(this);
								if ($markStart.length > 0) {
									$(this).DF_rectangle($markStart).DF_showMarker(markState);
								}
							}
						}).mouseout(function(){
							$(this).removeClass("hover");
							
						}).mousedown(function(){
							if (o.simpleSelection) {
								simpleSelectState = !($(this).hasClass("selected"));
								$simpleSelectStart = $(this).DF_showMarker(simpleSelectState);
								return false;
							}
							if (o.onSelectStart($(this)) !== false && o.isSelectable) {
								markState = !($(this).attr("rel") == t.currentMarker);
								// console.log(markState,t.currentMarker,$(this).attr("class"));
								$markStart = $(this).DF_showMarker(markState);
								return false;
							}
						}).mouseup(function(){
							if (o.simpleSelection) {
								$simpleSelectEnd = $(this);
								simpleSelectFinish();
								return false;
							}
							if (o.onSelectEnd($(this)) !== false && o.isSelectable ) {
								$markEnd = $(this);
								markFinish();
								return false;
							}
						});
						
						
						dayOfWeek++;
						dayOfWeek%=7;
						if (dayOfWeek == 0 ) numWeek++;
					}
					
					while (day<31) {
						$td = $("<td class='DF_empty'>").html("&nbsp;");
						$td.appendTo($tr);
						day++;
					}
					
										
					var $td = $("<td class='DF_month_marker'>").html(zeroPrefix(month+1,2));
					$td.click(function(){
						$(this).prev().mousedown();
						$(this).prevAll(".DF_day:last").mouseover().mouseup().mouseout();
					}).appendTo($tr);

					
					$tbody.append($tr);
					
					
					month++;
					month%=12;
					if (month==0) {
						year++;
					}
				}
				
				t.$container.append($table);
				
				// markers
				$markers = $("<div class='DF_markers'>");
				var $marker;
				for (var markerName in o.markers) {
					var cm = o.markers[markerName];
					$marker = $("<span class='DF_marker'>").addClass(cm.style).attr("title",markerName).click(function(){
						if (o.allowMarkerSelection) {
							$(this).addClass("current").siblings().removeClass("current");
							t.currentMarker = $(this).attr("title");
						}
					});

					$marker.html(cm.title);
					$markers.append($marker);
				}
				
				if (o.allowMarkerSelection) {
					$markers.find("[title="+t.currentMarker+"]").addClass("current");
				}
				t.$container.append($markers);
				
			},
			reconstruct:function(){
				if (!o.markers[t.currentMarker]) {
					for (var x in o.markers) {
						t.currentMarker = x;
						break;
					}
				}
				t.$container.children().remove();
				o.range = expandRange(o.range);
				t.render(o.range);
				t.select(o.selected);
			}
		}
	
		var daysInMonth = function(iYear,iMonth) {
			return 32 - new Date(iYear, iMonth, 32).getDate();
		}
		
		
		var expandRange = function(rangeMixed) {
			var rangeObject = {start:{year:0,month:0},end:{year:0,month:0}};
			var startList = [0,0], endList = [0,0];
			if (typeof rangeMixed == "object") {
				if  (rangeMixed.hasOwnProperty("length")) {
					startList = rangeMixed[0].split("-");
					endList = rangeMixed[1].split("-");
				} else {
					if (typeof rangeMixed.start == "string") {
						var startList = rangeMixed.start.split("-");
					} else {
						startList[0] = rangeMixed.start.year;
						startList[1] = rangeMixed.start.month;
					}
					if (typeof rangeMixed.end == "string") {
						var endList = rangeMixed.end.split("-");
					} else {
						endList[0] = rangeMixed.end.year;
						endList[1] = rangeMixed.end.month;
					}
				}
										
			} else if (typeof rangeMixed == "string") {
				rangeList = rangeMixed.split(":");
				startList = rangeList[0];
				endList = rangeList[1];
			} else {
				return rangeObject
			}
			
			rangeObject.start.year = startList[0]*1;
			rangeObject.start.month = startList[1]*1;

			rangeObject.end.year = endList[0]*1;
			rangeObject.end.month = endList[1]*1;

			
			return rangeObject;
		}
				
		t.reconstruct();
		
		$(this)[0].__DF__ = t;
		
		return $(this);
	}

});


//////
function date (format, timestamp) {
    // http://kevin.vanzonneveld.net
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +      parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: MeEtc (http://yass.meetcweb.com)
    // +   improved by: Brad Touesnard
    // +   improved by: Tim Wiel
    // +   improved by: Bryan Elliott
    //
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: David Randall
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +  derived from: gettimeofday
    // +      input by: majak
    // +   bugfixed by: majak
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Alex
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Thomas Beaucourt (http://www.webapp.fr)
    // +   improved by: JT
    // +   improved by: Theriault
    // +   improved by: Rafa³ Kukawski (http://blog.kukawski.pl)
    // +      input by: Martin
    // +      input by: Alex Wilson
    // %        note 1: Uses global: php_js to store the default timezone
    // %        note 2: Although the function potentially allows timezone info (see notes), it currently does not set
    // %        note 2: per a timezone specified by date_default_timezone_set(). Implementers might use
    // %        note 2: this.php_js.currentTimezoneOffset and this.php_js.currentTimezoneDST set by that function
    // %        note 2: in order to adjust the dates in this function (or our other date functions!) accordingly
    // *     example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
    // *     returns 1: '09:09:40 m is month'
    // *     example 2: date('F j, Y, g:i a', 1062462400);
    // *     returns 2: 'September 2, 2003, 2:26 am'
    // *     example 3: date('Y W o', 1062462400);
    // *     returns 3: '2003 36 2003'
    // *     example 4: x = date('Y m d', (new Date()).getTime()/1000); 
    // *     example 4: (x+'').length == 10 // 2009 01 09
    // *     returns 4: true
    // *     example 5: date('W', 1104534000);
    // *     returns 5: '53'
    // *     example 6: date('B t', 1104534000);
    // *     returns 6: '999 31'
    // *     example 7: date('W U', 1293750000.82); // 2010-12-31
    // *     returns 7: '52 1293750000'
    // *     example 8: date('W', 1293836400); // 2011-01-01
    // *     returns 8: '52'
    // *     example 9: date('W Y-m-d', 1293974054); // 2011-01-02
    // *     returns 9: '52 2011-01-02'
    var that = this,
        jsdate, f, formatChr = /\\?([a-z])/gi,
        formatChrCb,
        // Keep this here (works, but for code commented-out
        // below for file size reasons)
        //, tal= [],
        _pad = function (n, c) {
            if ((n = n + '').length < c) {
                return new Array((++c) - n.length).join('0') + n;
            }
            return n;
        },
        txt_words = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    formatChrCb = function (t, s) {
        return f[t] ? f[t]() : s;
    };
    f = {
        // Day
        d: function () { // Day of month w/leading 0; 01..31
            return _pad(f.j(), 2);
        },
        D: function () { // Shorthand day name; Mon...Sun
            return f.l().slice(0, 3);
        },
        j: function () { // Day of month; 1..31
            return jsdate.getDate();
        },
        l: function () { // Full day name; Monday...Sunday
            return txt_words[f.w()] + 'day';
        },
        N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
            return f.w() || 7;
        },
        S: function () { // Ordinal suffix for day of month; st, nd, rd, th
            var j = f.j();
            return j > 4 || j < 21 ? 'th' : {1: 'st', 2: 'nd', 3: 'rd'}[j % 10] || 'th';
        },
        w: function () { // Day of week; 0[Sun]..6[Sat]
            return jsdate.getDay();
        },
        z: function () { // Day of year; 0..365
            var a = new Date(f.Y(), f.n() - 1, f.j()),
                b = new Date(f.Y(), 0, 1);
            return Math.round((a - b) / 864e5) + 1;
        },

        // Week
        W: function () { // ISO-8601 week number
            var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
                b = new Date(a.getFullYear(), 0, 4);
            return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
        },

        // Month
        F: function () { // Full month name; January...December
            return txt_words[6 + f.n()];
        },
        m: function () { // Month w/leading 0; 01...12
            return _pad(f.n(), 2);
        },
        M: function () { // Shorthand month name; Jan...Dec
            return f.F().slice(0, 3);
        },
        n: function () { // Month; 1...12
            return jsdate.getMonth() + 1;
        },
        t: function () { // Days in month; 28...31
            return (new Date(f.Y(), f.n(), 0)).getDate();
        },

        // Year
        L: function () { // Is leap year?; 0 or 1
            return new Date(f.Y(), 1, 29).getMonth() === 1 | 0;
        },
        o: function () { // ISO-8601 year
            var n = f.n(),
                W = f.W(),
                Y = f.Y();
            return Y + (n === 12 && W < 9 ? -1 : n === 1 && W > 9);
        },
        Y: function () { // Full year; e.g. 1980...2010
            return jsdate.getFullYear();
        },
        y: function () { // Last two digits of year; 00...99
            return (f.Y() + "").slice(-2);
        },

        // Time
        a: function () { // am or pm
            return jsdate.getHours() > 11 ? "pm" : "am";
        },
        A: function () { // AM or PM
            return f.a().toUpperCase();
        },
        B: function () { // Swatch Internet time; 000..999
            var H = jsdate.getUTCHours() * 36e2,
                // Hours
                i = jsdate.getUTCMinutes() * 60,
                // Minutes
                s = jsdate.getUTCSeconds(); // Seconds
            return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
        },
        g: function () { // 12-Hours; 1..12
            return f.G() % 12 || 12;
        },
        G: function () { // 24-Hours; 0..23
            return jsdate.getHours();
        },
        h: function () { // 12-Hours w/leading 0; 01..12
            return _pad(f.g(), 2);
        },
        H: function () { // 24-Hours w/leading 0; 00..23
            return _pad(f.G(), 2);
        },
        i: function () { // Minutes w/leading 0; 00..59
            return _pad(jsdate.getMinutes(), 2);
        },
        s: function () { // Seconds w/leading 0; 00..59
            return _pad(jsdate.getSeconds(), 2);
        },
        u: function () { // Microseconds; 000000-999000
            return _pad(jsdate.getMilliseconds() * 1000, 6);
        },

        // Timezone
        e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
            // The following works, but requires inclusion of the very large
            // timezone_abbreviations_list() function.
/*              return this.date_default_timezone_get();
*/
            throw 'Not supported (see source code of date() for timezone on how to add support)';
        },
        I: function () { // DST observed?; 0 or 1
            // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
            // If they are not equal, then DST is observed.
            var a = new Date(f.Y(), 0),
                // Jan 1
                c = Date.UTC(f.Y(), 0),
                // Jan 1 UTC
                b = new Date(f.Y(), 6),
                // Jul 1
                d = Date.UTC(f.Y(), 6); // Jul 1 UTC
            return 0 + ((a - c) !== (b - d));
        },
        O: function () { // Difference to GMT in hour format; e.g. +0200
            var a = jsdate.getTimezoneOffset();
            return (a > 0 ? "-" : "+") + _pad(Math.abs(a / 60 * 100), 4);
        },
        P: function () { // Difference to GMT w/colon; e.g. +02:00
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2));
        },
        T: function () { 
            return 'UTC';
        },
        Z: function () { // Timezone offset in seconds (-43200...50400)
            return -jsdate.getTimezoneOffset() * 60;
        },

        // Full Date/Time
        c: function () { // ISO-8601 date.
            return 'Y-m-d\\Th:i:sP'.replace(formatChr, formatChrCb);
        },
        r: function () { // RFC 2822
            return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
        },
        U: function () { // Seconds since UNIX epoch
            return jsdate.getTime() / 1000 | 0;
        }
    };
    this.date = function (format, timestamp) {
        that = this;
        jsdate = ((typeof timestamp === 'undefined') ? new Date() : // Not provided
        (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
        new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
        );
        return format.replace(formatChr, formatChrCb);
    };
    return this.date(format, timestamp);
}


