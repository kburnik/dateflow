
*******************************************************************************************

DateFlow - a jQuery plugin by Kristijan Burnik

*******************************************************************************************

// sample dateflow setup

$(function() {
	
	$(".dateflow").dateflow({
		markers:{
			occupied:{
				style:"darkgreen",
				letter:"O",
				title:'Zauzeto'
			},
			vacant:{
				style:"darkred",
				letter:"V",
				title:'Slobodno'
			}
		},
		defaultMarker:'vacant',
		selected:{
			vacant:['2011-01-01','2011-01-02','2011-01-03'],
			occupied:['2011-03-01','2011-03-02','2011-03-03']
		},
		range:{start:'2011-01',end:'2011-12'},
		onSelectComplete:function(dates,currentMarker) {
			
		}
	});
	
	console.log($(".dateflow").dateflow("get","occupied"));
});