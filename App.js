const {app, BrowserWindow, ipcMain} = require('electron')

var fs = require('fs');
var files = fs.readdirSync('/');
target = "dummy"

fs.readFile('target.json', 'utf8', function (err,data) {
	if (err) 
	{
		fs.open("target.json","w",function(erro,file){
			if (erro) throw erro
			console.log("saved!");
		})
		fs.writeFile("target.json","dummy",function (err) 
			{
				if (err) throw err;
				console.log('Replaced!')
			})
	}
	else
	{
		//open it and read it. 
		target = data;

		files = fs.readdirSync(target);
		filelist = walk(target)
		console.log("filelist saved")

		global.filedata = filelist;
	}
});

var files = fs.readdirSync(target);

var filelist = []

var walk = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) results = results.concat(walk(file))
        else results.push(file)
    })
    return results
}

filelist = walk(target)

//locate old tags.json
var tagdata = {}

fs.readFile('tags.json', 'utf8', function (err,data) {
	if (err) 
	{
		//no file exists
		global.tagdata = [];
		fs.open("tags.json","w",function(erro,file){
			if (erro) throw erro
			console.log("saved!");
		})
		fs.writeFile("tags.json","{}",function (err) 
			{
				if (err) throw err;
				console.log('Replaced!')
			})
	}
	else
	{
		//open it and read it. 
		tagdata = JSON.parse(data);
		//console.log("tagdata: "+data)
		//win.webContents.send("new_tagdata",tagdata)
	}
});

global.filedata = filelist;


require('electron-debug')();

function createWindow(){
	win = new BrowserWindow({width: 800, height: 600,webPreferences: {devTools: true}})

	win.setMenu(null)

	win.loadFile('index.html')

	win.maximize();

	
}

ipcMain.on("updatetags", (event, arg) => {
	data = arg;

	console.log("save received.");

	tagdata[data.id]=data.new_data;
	console.log("new data: "+data.new_data)

	fs.writeFile("tags.json",JSON.stringify(tagdata), function (err) 
	{
		if (err) throw err;
		console.log('Replaced!')
	})
	console.log("new data: "+JSON.stringify(tagdata))

	win.webContents.send("new_tagdata",tagdata)
})

ipcMain.on("requestSettings", (event,arg) => {
	win = new BrowserWindow({width: 800, height: 600,webPreferences: {devTools: true}})

	win.setMenu(null)

	win.loadFile('settings.html')
})

setTimeout(createWindow,100)