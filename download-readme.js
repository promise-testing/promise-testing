var https = require('https');
var fs = require('fs');

//var output = process.stdout;

var output = "";
var options = {
	hostname:'api.github.com',
	port:443,
	//path:'/repos/promise-testing/promise-testing/git/trees/76b8df9bc3688cbbeafde330c3f00ff719d991b9',
	path:'/repos/promise-testing/promise-testing/git/blobs/ad55273c3d2084642eec136ce9ebd822b279e042',
	method:'get',
	rejectUnauthorized:false,
	auth:'jamestalmage:r6hQVbzl',
	headers:{'content-type':'text/plain'}
}

var data = {
	text: fs.readFileSync('README.md','utf-8'),
	mode: "gfm",
	context: "promise-testing/promise-testing"
}

var req = https.request(options,function(res){
	//console.error('statusCode: ', res.statusCode);
	//console.error('headers: ', res.headers);
	
	res.on('data',function(d){
	   output += d;
		//console.log(d);
		//output.write(d);
	})
	.on('end',function(d){
		var content = JSON.parse(output).content;
		
		var parsedContent = new Buffer(content,'base64').toString();
		console.log(parsedContent)
		
		//console.log(JSON.stringify(JSON.parse(output),4,4));
	})
	/*.on('end',function(d){
		output.write('</body></html>')
	});*/
	
});
//req.write((data.text));
req.end();

req.on('error',function(e){
	console.error(e);
	process.exit(1);
});
