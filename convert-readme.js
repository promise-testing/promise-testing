var https = require('https');
var fs = require('fs');

var output = process.stdout;

output.write('<html><head><link rel="stylesheet" type="text/css"' 
					+ ' href="'
					+ 'https://raw.github.com/johnmdonahue/git_marked/master/gfm.css'
				//+ 'https://raw.github.com/makotokw/wp-gfm/master/css/pygments.css'
					+ '">'
			 		+ '</head><body>')

var options = {
	hostname:'api.github.com',
	port:443,
	path:'/markdown/raw',
	method:'post',
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
		output.write(d);
	})
	.on('end',function(d){
		output.write('</body></html>')
	});
	
});
req.write((data.text));
req.end();

req.on('error',function(e){
	console.error(e);
	process.exit(1);
});
