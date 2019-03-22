var config = require('./config.js')
var cmds = require('./clicmds.js')
var command = process.argv[2]
var CryptoJS = require("crypto-js")
const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')
const bs58 = require('base-x')(config.b58Alphabet)
var fetch = require("node-fetch")

for (let i = 0; i < process.argv.length; i++) {
	if (process.argv[i] == '--spam') {
		var spamming = true
		var spamDelay = Math.round(1000/parseInt(process.argv[i+1]))
		process.argv.splice(i,2)
	}
}

function sendTx(tx) {
	var port = process.env.API_PORT || 3001
	var ip = process.env.API_IP || '[::1]'
	var protocol = process.env.API_PROTOCOL || 'http'
	var url = protocol+'://'+ip+':'+port+'/transact'
	fetch(url, {
		method: 'post',
		headers: {
		  'Accept': 'application/json, text/plain, */*',
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify(tx)
	}).then(function(res) {
		if (res.statusText != 'OK')
			console.log('Err: ' + res.statusText)
	});
}

if (spamming) {
	setInterval(function() { handle() }, spamDelay)
} else {
	handle()
}

function handle() {
	switch (command) {
		case 'keypair':
			const msg = randomBytes(32)
			let priv, pub
			do {
				priv = randomBytes(32)
				pub = secp256k1.publicKeyCreate(priv)
			} while (!secp256k1.privateKeyVerify(priv))
		
			console.log({
				pub: bs58.encode(pub),        
				priv: bs58.encode(priv)
			})
			break;
			
		case 'sign':
			console.log(cmds.sign(process.argv[3], process.argv[4], process.argv[5]))
			break;
	
		case 'createAccount':
			sendTx(cmds.createAccount(process.argv[5], process.argv[6]))
			break;
	
		case 'approveNode':
			// node user
			sendTx(cmds.approveNode(process.argv[5]))
			break;
	
		case 'disapproveNode':
			// node user
			sendTx(cmds.disapproveNode(process.argv[5]))
			break;
		
		case 'transfer':
			// reciever, amount
			sendTx(cmds.transfer(process.argv[5], process.argv[6], process.argv[7]))
			break;
	
		case 'post':
			// uri, conent json
			sendTx(cmds.post(process.argv[5], process.argv[6]))
			break;
	
		case 'comment':
			// uri, parent author, parent permalink, content json
			sendTx(cmds.comment(process.argv[5], process.argv[6], process.argv[7], process.argv[8]))
			break;
	
		case 'vote':
			// uri, author, weight, tag
			sendTx(cmds.vote(process.argv[5], process.argv[6], process.argv[7], process.argv[8]))
			break;
	
		case 'profile':
			// content
			sendTx(cmds.profile(process.argv[5]))
			break;
	
		case 'follow':
			// username
			sendTx(cmds.follow(process.argv[5]))
			break;
	
		case 'unfollow':
			// username
			sendTx(cmds.unfollow(process.argv[5]))
			break;
		
		case 'newKey':
			// username
			sendTx(cmds.newKey(process.argv[5], process.argv[6], process.argv[7]))
			break;
	
		case 'removeKey':
			// username
			sendTx(cmds.removeKey(process.argv[5]))
			break;
	
		default:
			break;
	}	
}

