window.nodeRequire = require;

var $ = global.jQuery = require('./jquery-2.1.4.min');

e = nodeRequire("electron");
fs = nodeRequire("fs");

target = "dummy"

tagtotal = {};

resetcol = false;

clicked_lm=0;
mpos={x:0,y:0}

layers = [];

selected_layer = 0;
res = 32;

tool = 0;
colors = []
colors[0] = "gray";
colors[1] = "white";
paint_color = 1;

hovering_twod_canv=false;

var theta_x = -5;
var theta_y = -135;
var theta_z = -160;

var offset_pan_x=0;
var offset_pan_y=0;

var offset_trans_x=-100;
var offset_trans_y=-100;
var crude_zoom_factor = 20;

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
    var twod_canvas = document.getElementById('canvas-2d');
    if (twod_canvas.getContext)
    {
        ctx_paint = twod_canvas.getContext('2d');
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

	$('.newlayerbut').click(function(){
		layers.push({grid:[],name:"Layer "+layers.length,settings:{},visible:true,selected:false})
		for (var xx=0; xx<res; xx++)
		{
			layers[layers.length-1].grid[xx]=[]
			for (var yy=0; yy<res; yy++)
			{
				layers[layers.length-1].grid[xx][yy]=-1;
			}
		}

		render_layer_UI();
	})

	loop();
}

function sort_by_date(a,b){
	return b.date-a.date
}

function render_layer_UI(){
	str = ""
	for (var i=0; i<layers.length; i++)
	{
		tl = layers[i];

		selstr = ''
		if (tl.selected)
			selstr = 'selected'

		str+= "<div class='layer "+selstr+"' id="+i+"><h3>"+tl.name+"</h3><div class='tinybut deletebut' style='margin-left:auto'><span class='icon-bin'></span></div> <div class='tinybut movedownbut'><span class='icon-menu3'></span></div><div class='tinybut moveupbut'><span class='icon-menu4'></span></div></div>"
	}

	$('.layerbox').html(str);

	$('.layer').click(function(){
		tgt = $(this).attr("id");
		for (var i=0; i<layers.length; i++)
		{
			layers[i].selected=false;
		}
		layers[tgt].selected=true;

		$('.layer').removeClass("selected")
		$(this).addClass("selected")
	})

	$('#canvas-2d').mouseenter(function(){
		hovering_twod_canv=true;
	})
	$('#canvas-2d').mouseleave(function(){
		hovering_twod_canv=false;
	})
}

function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function loop(){
	//dragging
	if (clicked_lm==1)
	{
		// cur_pos = {x:parseFloat($('.subimgholder').css("left")),y:parseFloat($('.subimgholder').css("top"))}
		drag.mode=1;

		drag.start.x=mpos.x;
		drag.start.y=mpos.y;

		drag.pos_start.x=mpos_paint.x;
		drag.pos_start.y=mpos_paint.y;

		clicked_lm=2;
	}

	if (clicked_lm==2)
	{
		if (drag.mode==1)
		{

			// offset_trans_x = (mpos.x-drag.start.x)
			// offset_trans_y = (mpos.y-drag.start.y)
		}

		//paint
		if (hovering_twod_canv)
		{
			for (var l=0; l<layers.length; l++)
				{
					tl = layers[l];
					if (layers[l].selected)
					{
						if (tl.grid[mouse_cell.x] && tl.grid[mouse_cell.x][mouse_cell.y])
						tl.grid[mouse_cell.x][mouse_cell.y]=paint_color;
					}
				}
			}
	}
	
	if (clicked_lm==3)
	{
		drag_mode=0;
	}

	//mouse cell
		mpos_paint = {x:mpos.x-$('#canvas-2d').offset().left-(twod_canvas.width/(res*2)),y:mpos.y-$('#canvas-2d').offset().top-(twod_canvas.width/(res*2))}
		mouse_cell = {x:Math.round(mpos_paint.x/(twod_canvas.width/res)),y:Math.round(mpos_paint.y/(twod_canvas.width/res))}

	ctx_paint.clearRect(0,0,twod_canvas.width,twod_canvas.height);
	ctx_paint.fillStyle="black";
	ctx_paint.fillRect(0,0,twod_canvas.width,twod_canvas.height);

	//draw tool
		ctx_paint.lineWidth=2;
		ctx_paint.strokeStyle="green";
		ctx_paint.strokeRect(mouse_cell.x*(twod_canvas.width/res),mouse_cell.y*(twod_canvas.width/res),twod_canvas.width/res,twod_canvas.height/res)

	//draw tiles
		for (var l=0; l<layers.length; l++)
		{
			tl = layers[l];
			if (layers[l].selected)
			{
				for (var xx=0; xx<res; xx++)
				{
					for (var yy=0; yy<res; yy++)
					{
						if (tl.grid[xx][yy]!=-1)
						{
							defn = tl.grid[xx][yy];
							ctx_paint.fillStyle = colors[defn]
							ctx_paint.fillRect(xx*(twod_canvas.width/res),yy*(twod_canvas.width/res),(twod_canvas.width/res),(twod_canvas.width/res))
						}
					}
				}
			}
		}

	//draw grid
		ctx_paint.strokeStyle="gray";
		ctx_paint.lineWidth = 1

		for (var i=0; i<res+1; i++)
		{
			ctx_paint.beginPath()
			ctx_paint.moveTo((i/res)*twod_canvas.width,0)
			ctx_paint.lineTo((i/res)*twod_canvas.width,twod_canvas.height)
			ctx_paint.stroke();
		}

		for (var i=0; i<res+1; i++)
		{
			ctx_paint.beginPath()
			ctx_paint.moveTo(0,(i/res)*twod_canvas.height)
			ctx_paint.lineTo(twod_canvas.width,(i/res)*twod_canvas.height)
			ctx_paint.stroke();
		}

	//draw 3D stuff.
		ctx_p.clearRect(0,0,preview.width,preview.height);
		ctx_p.fillStyle = "black";
		ctx_p.fillRect(0,0,preview.width,preview.height);

		unt_face_buffer = [];
		for (var l=0; l<layers.length; l++)
		{
			tl = layers[l];
			for (var xx=0; xx<res; xx++)
			{
				for (var yy=0; yy<res; yy++)
				{
					if (tl.grid[xx][yy]!=-1)
					{
						def = colors[tl.grid[xx][yy]]
						cube = cube_tris(xx-(res/2)+offset_pan_x,yy-(res/2)+offset_pan_y,l)
						for (var i=0; i<cube.length; i++)
						{
							unt_face_buffer.push({col:def,points:cube[i]})
						}
					}
				}
			}
		}

		trans_face_buffer=[]
		//zxy
		for (var i=0; i<unt_face_buffer.length; i++)
		{
			tt = unt_face_buffer[i];
			tb = []
			for (var ii=0; ii<tt.points.length; ii++)
			{
				var trans_1 = z_rotation(tt.points[ii][0],tt.points[ii][1],tt.points[ii][2],theta_z)
				var trans_2 = x_rotation(trans_1.x,trans_1.y,trans_1.z,theta_x)
				var final = y_rotation(trans_2.x,trans_2.y,trans_2.z,theta_y)
				tb.push({x:final.x,y:final.y,z:final.z});
			}
			trans_face_buffer.push({verts:tb,col:tt.col});
		}

		face_buffer = trans_face_buffer.sort(sort_by_avg_depth)

		for (var i=0; i<face_buffer.length; i++)
		{
			tfb= face_buffer[i].verts
			ctx_p.fillStyle=face_buffer[i].col;
			ctx_p.beginPath()
			ctx_p.moveTo((tfb[0].x*crude_zoom_factor)-offset_trans_x,(tfb[0].y*crude_zoom_factor)-offset_trans_y)
			ctx_p.lineTo((tfb[1].x*crude_zoom_factor)-offset_trans_x,(tfb[1].y*crude_zoom_factor)-offset_trans_y)
			ctx_p.lineTo((tfb[2].x*crude_zoom_factor)-offset_trans_x,(tfb[2].y*crude_zoom_factor)-offset_trans_y)
			ctx_p.closePath();
			ctx_p.fill();
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

function sort_by_avg_depth(a,b)
{
	depth_a = (a.verts[0].z+a.verts[1].z+a.verts[2].z)/3
	depth_b = (b.verts[0].z+b.verts[1].z+b.verts[2].z)/3

	return depth_a-depth_b;
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

	main_width = $('.mainsection').width();
	twod_canvas.width = Math.min(vph*.75,main_width);
	twod_canvas.height = Math.min(vph*.75,main_width);
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

function cube_tris(x,y,z)
{
var verts = [[],
	[x+0,y+0,z+0],
	[x+0,y+1,z+0],
	[x+1,y+0,z+0],
	[x+1,y+1,z+0],
	[x+1,y+0,z+1],
	[x+1,y+1,z+1],
	[x+0,y+0,z+1],
	[x+0,y+1,z+1]]

var tris = [[verts[1],verts[2],verts[4]],
	[verts[3],verts[4],verts[6]],
	[verts[5],verts[6],verts[8]],
	[verts[7],verts[8],verts[2]],
	[verts[2],verts[8],verts[6]],
	[verts[7],verts[1],verts[3]],
	[verts[1],verts[4],verts[3]],
	[verts[3],verts[6],verts[5]],
	[verts[5],verts[8],verts[7]],
	[verts[7],verts[2],verts[1]],
	[verts[2],verts[6],verts[4]],
	[verts[7],verts[3],verts[5]]
	]

//compute averages for real depth sorting

//compute normals in the future for backface culling

return tris;
}

$(document).ready(main)
$(document).ready(resizeDiv)