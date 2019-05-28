window.nodeRequire = require;

var $ = global.jQuery = require('./jquery-2.1.4.min');

e = nodeRequire("electron");
fs = nodeRequire("fs");

target = "dummy"

tagtotal = {};

resetcol = false;

clicked_lm=0;
mpos={x:0,y:0}

$("body").mousemove(function(e) {
	    mpos.x = e.pageX
	   	mpos.y = e.pageY
	})

//boilerplate canvas code
	// var canvas = document.getElementById('canvas');
 //    if (canvas.getContext)
 //    {
 //        ctx = canvas.getContext('2d');
 //    }

    var preview = document.getElementById('preview');
    if (preview.getContext)
    {
        ctx_p = preview.getContext('2d');
    }

document.body.addEventListener('mousedown', function(){
		clicked_lm=1;
	}, true); 

document.body.addEventListener('mouseup', function(){
		clicked_lm=3;
	}, true); 

drag = {start:{x:0,y:0},mode:0,pos_start:{x:0,y:0}}

var main=function(){	
	//zooming
	$(window).bind('mousewheel', function(event) {

	});



	loop();
}

function sort_by_date(a,b){
	return b.date-a.date
}

function loop(){
		//dragging
	if (clicked_lm==1)
	{
		cur_pos = {x:parseFloat($('.subimgholder').css("left")),y:parseFloat($('.subimgholder').css("top"))}
		drag.mode=1;

		drag.start.x=mpos.x;
		drag.start.y=mpos.y;

		drag.pos_start.x=cur_pos.x;
		drag.pos_start.y=cur_pos.y;

		clicked_lm=2;
	}

	if (clicked_lm==2)
	{
		if (drag.mode==1)
		{

			new_pos_x = (mpos.x-drag.start.x)/(Math.pow(cur_zoom,.2))+drag.pos_start.x;
			new_pos_y = (mpos.y-drag.start.y)/(Math.pow(cur_zoom,.2))+drag.pos_start.y;
		}
	}
	
	if (clicked_lm==3)
	{
		drag_mode=0;
	}

	requestAnimationFrame(loop);
}

function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}

window.onresize = function(event) {
resizeDiv();
}


function resizeDiv() {
	vpw = $(window).width();
	vph = $(window).height();

	m=detectmob()

	$('.key-segment').css({height:vph+"px"})

	rbar_width = $('.rightbar').width();
	preview.height = rbar_width;
	preview.width = rbar_width;

	$('.window').each(function(){
		w = $(this).parent().width();
		$(this).css({height:w+"px"})
	})
}


function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round(b * 255)};
}

$(document).ready(main)
$(document).ready(resizeDiv)