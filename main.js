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
selected_hue = 0;
selected_col = hslToRgb(selected_hue,.5,.5)

hovering_twod_canv=false;
hovering_cp_canv=false;
hovering_preview_canv=false;

var theta_x = -5;
var theta_y = -135;
var theta_z = -160;

var offset_pan_x=0;
var offset_pan_y=0;

var offset_trans_x=-200;
var offset_trans_y=-300;
var crude_zoom_factor = 10;

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

    var colorp = document.getElementById('canvas-colorp');
    if (colorp.getContext)
    {
        ctx_cp = colorp.getContext('2d');
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

	$('#canvas-2d').mouseenter(function(){
		hovering_twod_canv=true;

	})
	$('#canvas-2d').mouseleave(function(){
		hovering_twod_canv=false;
	})

	$('#canvas-colorp').mouseenter(function(){
		hovering_cp_canv=true;
	})
	$('#canvas-colorp').mouseleave(function(){
		hovering_cp_canv=false;
	})

	$('#preview').mouseenter(function(){
		hovering_preview_canv=true;

	})
	$('#preview').mouseleave(function(){
		hovering_preview_canv=false;
	})

	$('.newcolorbut').click(function(){
		colors.push("rgb("+Math.round(selected_col.r)+","+Math.round(selected_col.g)+","+Math.round(selected_col.b)+")")
		render_color_UI();
	})

	$('.toolbut').click(function(){
		tool = parseInt($(this).attr("id"));
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
}

function render_color_UI(){
	str = ""
	str+="<div class='tinybut colorbut' id=-1 style='background-color:black'></div>";
	for (var i=1; i<colors.length; i++)
	{
		col = colors[i];
		str+="<div class='tinybut colorbut' id="+i+" type="+JSON.stringify(colors[i])+" style='background-color:"+col+"'></div>";
	}

	$('.pallettebox').html(str);

	$('.colorbut').click(function(){
		$(".colorbut").removeClass("colorbut-selected")
		$(this).addClass("colorbut-selected");

		id = $(this).attr("id");
		id = parseInt(id);

		paint_color=id;
	})
}

function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function loop(){
	mpos_cp = {x:mpos.x-$('#canvas-colorp').offset().left,y:mpos.y-$('#canvas-colorp').offset().top}
	//dragging
	if (clicked_lm==1)
	{
		// cur_pos = {x:parseFloat($('.subimgholder').css("left")),y:parseFloat($('.subimgholder').css("top"))}
		drag.mode=1;

		drag.start.x=mpos.x;
		drag.start.y=mpos.y;

		drag.pos_start.x=theta_z
		drag.pos_start.y=theta_x

		clicked_lm=2;

		dis = point_distance({x:colorp.width/2,y:colorp.height/2},mpos_cp)
		if (hovering_cp_canv && dis>base_r)
		{
			dir = (-point_direction({x:colorp.width/2,y:colorp.height/2},mpos_cp)+360)%360
			selected_hue = dir/360
		}

		if (hovering_cp_canv && Math.abs(mpos_cp.x-center_x)<span/2 && Math.abs(mpos_cp.y-center_y)<span/2)
		{
			x = (mpos_cp.x - cp_start_x)/(span);
			y = (mpos_cp.y - cp_start_y)/(span);
			selected_col = hslToRgb(selected_hue,x,y)
		}
	}

	if (clicked_lm==2)
	{
		//re-orient preview
		if (drag.mode==1 && hovering_preview_canv)
		{

			theta_z = ((mpos.x-drag.start.x)/100)+drag.pos_start.x
			theta_x = ((mpos.y-drag.start.y)/100)+drag.pos_start.y
		}

		//paint
		if (hovering_twod_canv)
		{
			for (var l=0; l<layers.length; l++)
				{
					tl = layers[l];
					if (layers[l].selected)
					{
						if (tool==0)
						{
							if (tl.grid[mouse_cell.x] && tl.grid[mouse_cell.x][mouse_cell.y])
							{
								console.log("painting")
								tl.grid[mouse_cell.x][mouse_cell.y]=paint_color;
							}
						}
						if (tool==1)
						{
							if (tl.grid[mouse_cell.x] && tl.grid[mouse_cell.x][mouse_cell.y])
							tl.grid[mouse_cell.x][mouse_cell.y]=-1;
						}
						if (tool==2)
						{
							//flood fill
							to_be_filled = copy(tl.grid);
							out = flood_fill(to_be_filled,mouse_cell)
							for (var i=0; i<out.length;i++)
							{
								tl.grid[out[i].x][out[i].y]=paint_color;
							}
						}
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

	//draw color wheel
		ctx_cp.clearRect(0,0,colorp.width,colorp.height);
		ctx_cp.fillStyle="black"
		ctx_cp.fillRect(0,0,colorp.width,colorp.height)

		center_x = colorp.width/2;
		center_y = colorp.height/2;
		for (var i=0; i<90; i++)
		{
			base_r = 90;
			ctx_cp.beginPath()
			ld1 = lengthdir(base_r,i*4)
			ld2 = lengthdir(base_r+20,i*4)
			ld3 = lengthdir(base_r+20,(i+1.2)*4)
			ld4 = lengthdir(base_r,(i+1.2)*4)
			col = hslToRgb((i/90),.5,.5)

			ctx_cp.fillStyle="rgb("+col.r+","+col.g+","+col.b+")";
			
			ctx_cp.moveTo(ld1.x+center_x,ld1.y+center_y)
			ctx_cp.lineTo(ld2.x+center_x,ld2.y+center_y)
			ctx_cp.lineTo(ld3.x+center_x,ld3.y+center_y)
			ctx_cp.lineTo(ld4.x+center_x,ld4.y+center_y)
			ctx_cp.closePath();
			ctx_cp.fill();
		}

		//color grid
		ld = lengthdir(base_r-5,135);
		ld_2 = lengthdir(base_r-5,45);
		span = Math.abs(ld.x-ld_2.x)
		cp_start_x = ld.x + center_x;
		cp_start_y = ld.y + center_y;
		cp_grid_res = 20
		for (var xx=0; xx<cp_grid_res; xx++)
		{
			for (var yy=0; yy<cp_grid_res; yy++)
			{
				x = span*(xx/cp_grid_res)+cp_start_x;
				y = span*(yy/cp_grid_res)+cp_start_y;
				x-=.5
				y-=.5

				size = span/cp_grid_res;
				col = hslToRgb(selected_hue,(xx/cp_grid_res),(yy/cp_grid_res))
				ctx_cp.fillStyle="rgb("+col.r+","+col.g+","+col.b+")";

				ctx_cp.fillRect(x,y,size*1.4,size*1.4);
			}
		}

		//color spot
		ctx_cp.fillStyle="rgb("+selected_col.r+","+selected_col.g+","+selected_col.b+")";
		ctx_cp.fillRect(0,colorp.height-50,50,50)


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

	colorp.width = $('#canvas-colorp').parent().width()
	colorp.height = $('#canvas-colorp').parent().height()-30


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

function flood_fill(cell_set,start){
	//NOTE! Valid cells must be 1 in order for this to work. Invalid cells will be marked 0.
	to_eval = [];
	to_eval.push(start);

	cells = copy(cell_set);

	var in_shape = [];

	//flood fill on that cell
	if (1==1)
	{	
		do 
		{
			if (cells[to_eval[0].x][to_eval[0].y+1]==-1)
			{
				to_eval.push({x:to_eval[0].x,y:to_eval[0].y+1})
				cells[to_eval[0].x][to_eval[0].y+1]=1;
			}

			if (cells[to_eval[0].x][to_eval[0].y-1]==-1)
			{
				to_eval.push({x:to_eval[0].x,y:to_eval[0].y-1})
				cells[to_eval[0].x][to_eval[0].y-1]=1
			}

			if (cells[to_eval[0].x+1] && cells[to_eval[0].x+1][to_eval[0].y]==-1)
			{
				to_eval.push({x:to_eval[0].x+1,y:to_eval[0].y})
				cells[to_eval[0].x+1][to_eval[0].y]=1
			}

			if (cells[to_eval[0].x-1] && cells[to_eval[0].x-1][to_eval[0].y]==-1)
			{
				to_eval.push({x:to_eval[0].x-1,y:to_eval[0].y})
				cells[to_eval[0].x-1][to_eval[0].y]=1
			}

			in_shape.push({x:to_eval[0].x,y:to_eval[0].y})
			to_eval.splice(0,1);
		}
		while (to_eval.length!=0)
	}

	return in_shape;
}


$(document).ready(main)
$(document).ready(resizeDiv)