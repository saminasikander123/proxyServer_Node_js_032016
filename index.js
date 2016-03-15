let http = require('http')
let fs = require('fs')
let request = require('request')
let argv = require('yargs').argv
// console.log(process.argv)
// console.log(argv)

let logStream = argv.logfile ? fs.createWriteStream(argv.logfile)
	: process.stdout
let localhost = '127.0.0.1'
let scheme = 'http://'
let host = argv.host || localhost
let port = argv.port || (host === localhost ? 8000 : 80)
let destinationUrl = scheme + host + ':' + port

// echoServer
http.createServer((req, res) => {
    // console.log(`Request received at: ${req.url}`)
    // res.end('hello world\n')
    // console.log(req.headers)
    // console.log('echoServer')

    logStream.write('echoServer\n')
    
    for (let header in req.headers) {
    	res.setHeader(header, req.headers[header])
    }
    logStream.write(JSON.stringify(req.headers)+'\n')
    req.pipe(res)
}).listen(8000)
logStream.write('echoServer listening @ 127.0.0.1:8000\n')

// proxyServer
http.createServer((req, res) => {
    // console.log('proxyServer')
    logStream.write('proxyServer\n')
    // x-destination-url
    // console.log(req.url)
    logStream.write(JSON.stringify(req.headers)+'\n')

    let url = destinationUrl
    if (req.headers['x-destination-url']) {
    	url = 'http://' + req.headers['x-destination-url']
    }

    let options = {
    	// url: 'http://127.0.0.1:8000' + req.url
    	// url: destinationUrl + req.url
    	url: url + req.url
    }
    
    req.pipe(request(options)).pipe(res)
}).listen(9000)
logStream.write('proxyServer listening @ 127.0.0.1:9000\n')
