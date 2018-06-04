'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');

require('./config.js');
var hfc = require('fabric-client');

var helper = require('./app/helper.js');
var createChannel = require('./app/create-channel.js');
var join = require('./app/join-channel.js');
var install = require('./app/install-chaincode.js');
var instantiate = require('./app/instantiate-chaincode.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || hfc.getConfigSetting('port');
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));
// set secret variable
app.set('secret', 'thisismysecret');
app.use(expressJWT({
	secret: 'thisismysecret'
}).unless({
	path: ['/users', '/register', '/login']
}));
app.use(bearerToken());
app.use(function(req, res, next) {
	logger.debug(' ------>>>>>> new request for %s',req.originalUrl);
	if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}

    if (req.originalUrl.indexOf('/register') >= 0) {
        return next();
    }

    if (req.originalUrl.indexOf('/login') >= 0) {
        return next();
    }

	var token = req.token;
	jwt.verify(token, app.get('secret'), function(err, decoded) {
		if (err) {
			res.send({
				success: false,
				message: 'Failed to authenticate token. Make sure to include the ' +
					'token returned from /users call in the authorization header ' +
					' as a Bearer token'
			});
			return;
		} else {
			// add the decoded user name and org name to the request object
			// for the downstream code to use
			req.username = decoded.username;
			req.orgname = decoded.orgName;
			logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
			return next();
		}
	});
});

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(port, function() {});
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************',host,port);
server.timeout = 240000;

function getErrorMessage(field) {
	var response = {
		success: false,
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Register and enroll user
app.post('/users', async function(req, res) {
	var username = req.body.username;
	var orgName = req.body.orgName;
	logger.debug('End point : /users');
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.json(getErrorMessage('\'orgName\''));
		return;
	}
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName
	}, app.get('secret'));
	let response = await helper.getRegisteredUser(username, orgName, true);
	logger.debug('-- returned from registering the username %s for organization %s',username,orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s',username,orgName);
		response.token = token;
		res.json(response);
	} else {
		logger.debug('Failed to register the username %s for organization %s with::%s',username,orgName,response);
		res.json({success: false, message: response});
	}

});
// Create Channel
app.post('/channels', async function(req, res) {
	logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
	logger.debug('End point : /channels');
	var channelName = req.body.channelName;
	var channelConfigPath = req.body.channelConfigPath;
	logger.debug('Channel name : ' + channelName);
	logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!channelConfigPath) {
		res.json(getErrorMessage('\'channelConfigPath\''));
		return;
	}

	let message = await createChannel.createChannel(channelName, channelConfigPath, req.username, req.orgname);
	res.send(message);
});
// Join Channel
app.post('/channels/:channelName/peers', async function(req, res) {
	logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
	var channelName = req.params.channelName;
	var peers = req.body.peers;
	logger.debug('channelName : ' + channelName);
	logger.debug('peers : ' + peers);
	logger.debug('username :' + req.username);
	logger.debug('orgname:' + req.orgname);

	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}

	let message =  await join.joinChannel(channelName, peers, req.username, req.orgname);
	res.send(message);
});
// Install chaincode on target peers
app.post('/chaincodes', async function(req, res) {
	logger.debug('==================== INSTALL CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodePath = req.body.chaincodePath;
	var chaincodeVersion = req.body.chaincodeVersion;
	var chaincodeType = req.body.chaincodeType;
	logger.debug('peers : ' + peers); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodePath) {
		res.json(getErrorMessage('\'chaincodePath\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!chaincodeType) {
		res.json(getErrorMessage('\'chaincodeType\''));
		return;
	}
	let message = await install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, req.username, req.orgname)
	res.send(message);
});
// Instantiate chaincode on target peers
app.post('/channels/:channelName/chaincodes', async function(req, res) {
	logger.debug('==================== INSTANTIATE CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodeVersion = req.body.chaincodeVersion;
	var channelName = req.params.channelName;
	var chaincodeType = req.body.chaincodeType;
	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('peers  : ' + peers);
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!chaincodeType) {
		res.json(getErrorMessage('\'chaincodeType\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await instantiate.instantiateChaincode(peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, fcn, args, req.username, req.orgname);
	res.send(message);
});
// Invoke transaction on chaincode on target peers
app.post('/channels/:channelName/chaincodes/:chaincodeName', async function(req, res) {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.params.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname);
	res.send(message);
});
// Query on chaincode on target peers
app.get('/channels/:channelName/chaincodes/:chaincodeName', async function(req, res) {
	logger.debug('==================== QUERY BY CHAINCODE ==================');
	var channelName = req.params.channelName;
	var chaincodeName = req.params.chaincodeName;
	let args = req.query.args;
	let fcn = req.query.fcn;
	let peer = req.query.peer;

	logger.debug('channelName : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn : ' + fcn);
	logger.debug('args : ' + args);

	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}
	args = args.replace(/'/g, '"');
	args = JSON.parse(args);
	logger.debug(args);

	let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
	res.send(message);
});
//  Query Get Block by BlockNumber
app.get('/channels/:channelName/blocks/:blockId', async function(req, res) {
	logger.debug('==================== GET BLOCK BY NUMBER ==================');
	let blockId = req.params.blockId;
	let peer = req.query.peer;
	logger.debug('channelName : ' + req.params.channelName);
	logger.debug('BlockID : ' + blockId);
	logger.debug('Peer : ' + peer);
	if (!blockId) {
		res.json(getErrorMessage('\'blockId\''));
		return;
	}

	let message = await query.getBlockByNumber(peer, req.params.channelName, blockId, req.username, req.orgname);
	res.send(message);
});
// Query Get Transaction by Transaction ID
app.get('/channels/:channelName/transactions/:trxnId', async function(req, res) {
	logger.debug('================ GET TRANSACTION BY TRANSACTION_ID ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let trxnId = req.params.trxnId;
	let peer = req.query.peer;
	if (!trxnId) {
		res.json(getErrorMessage('\'trxnId\''));
		return;
	}

	let message = await query.getTransactionByID(peer, req.params.channelName, trxnId, req.username, req.orgname);
	res.send(message);
});
// Query Get Block by Hash
app.get('/channels/:channelName/blocks', async function(req, res) {
	logger.debug('================ GET BLOCK BY HASH ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let hash = req.query.hash;
	let peer = req.query.peer;
	if (!hash) {
		res.json(getErrorMessage('\'hash\''));
		return;
	}

	let message = await query.getBlockByHash(peer, req.params.channelName, hash, req.username, req.orgname);
	res.send(message);
});
//Query for Channel Information
app.get('/channels/:channelName', async function(req, res) {
	logger.debug('================ GET CHANNEL INFORMATION ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let peer = req.query.peer;

	let message = await query.getChainInfo(peer, req.params.channelName, req.username, req.orgname);
	res.send(message);
});
//Query for Channel instantiated chaincodes
app.get('/channels/:channelName/chaincodes', async function(req, res) {
	logger.debug('================ GET INSTANTIATED CHAINCODES ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let peer = req.query.peer;

	let message = await query.getInstalledChaincodes(peer, req.params.channelName, 'instantiated', req.username, req.orgname);
	res.send(message);
});
// Query to fetch all Installed/instantiated chaincodes
app.get('/chaincodes', async function(req, res) {
	var peer = req.query.peer;
	var installType = req.query.type;
	logger.debug('================ GET INSTALLED CHAINCODES ======================');

	let message = await query.getInstalledChaincodes(peer, null, 'installed', req.username, req.orgname)
	res.send(message);
});
// Query to fetch channels
app.get('/channels', async function(req, res) {
	logger.debug('================ GET CHANNELS ======================');
	logger.debug('peer: ' + req.query.peer);
	var peer = req.query.peer;
	if (!peer) {
		res.json(getErrorMessage('\'peer\''));
		return;
	}

	let message = await query.getChannels(peer, req.username, req.orgname);
	res.send(message);
});


var userController = require('./controller/user-controller');
var photoController = require('./controller/photo-controller');
var bookController = require('./controller/book-controller');
var questionController = require('./controller/question-controller');
var arbitrationController = require('./controller/arbitration-controller');
//Register
app.post('/register', async function(req, res) {
    logger.debug('==================== Register ==================');
    console.log(req.body);
    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
        username: req.body.phone,
        orgName: req.body.password
    }, app.get('secret'));
    await userController.register(req, res, token);
});

//CarRegister
app.post('/carRegister', async function(req, res) {
    logger.debug('==================== Car Register ==================');
    console.log(req.body);
    await userController.carRegister(req, res);
});

//Login
app.post('/login', async function(req, res) {
    logger.debug('==================== Login ==================');
    console.log(req.body);
    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
        username: req.body.phone,
        orgName: req.body.password
    }, app.get('secret'));
    await userController.login(req, res, token);
});

//UserInfo
app.post('/userInfo', async function(req, res) {
    logger.debug('==================== User Info ==================');
    console.log(req.body);
    await userController.userInfo(req, res);
});

//UserName
app.post('/userName', async function(req, res) {
    logger.debug('==================== User Name ==================');
    console.log(req.body);
    await userController.userName(req, res);
});

//MinePhoto
app.post('/minePhoto', async function(req, res) {
    logger.debug('==================== Mine Photo ==================');
    console.log(req.body);
    await userController.minePhoto(req, res);
});

//MyCarPhoto
app.post('/myCarPhoto', async function(req, res) {
    logger.debug('==================== My Car Photo ==================');
    console.log(req.body);
    await userController.myCarPhoto(req, res);
});

//MineQuestion
app.post('/mineQuestion', async function(req, res) {
    logger.debug('==================== Mine Question ==================');
    console.log(req.body);
    await userController.mineQuestion(req, res);
});

//AnswerQuestion
app.post('/answerQuestion', async function(req, res) {
    logger.debug('==================== Answer Question ==================');
    console.log(req.body);
    await userController.answerQuestion(req, res);
});

//MineBook
app.post('/mineBook', async function(req, res) {
    logger.debug('==================== Mine Book ==================');
    console.log(req.body);
    await userController.mineBook(req, res);
});

//MineArbitration
app.post('/mineArbitration', async function(req, res) {
    logger.debug('==================== Mine Arbitration ==================');
    console.log(req.body);
    await userController.mineArbitration(req, res);
});

//VotedArbitration
app.post('/votedArbitration', async function(req, res) {
    logger.debug('==================== Voted Arbitration ==================');
    console.log(req.body);
    await userController.votedArbitration(req, res);
});

//SubmitPhoto
app.post('/submitPhoto', async function(req, res) {
    logger.debug('==================== Submit Photo ==================');
    console.log(req.body);
    await photoController.submitPhoto(req, res);
});

//ReceivePunOrAward
app.post('/receivePunOrAward', async function(req, res) {
    logger.debug('==================== Receive Pun Or Award ==================');
    console.log(req.body);
    await photoController.receivePunOrAward(req, res);
});

//PhotoList
app.post('/photoList', async function(req, res) {
    logger.debug('==================== Photo List ==================');
    console.log(req.body);
    await photoController.photoList(req, res);
});

//SubmitBook
app.post('/submitBook', async function(req, res) {
    logger.debug('==================== Submit Book ==================');
    console.log(req.body);
    await bookController.submitBook(req, res);
});

//BookList
app.post('/bookList', async function(req, res) {
    logger.debug('==================== Book List ==================');
    console.log(req.body);
    await bookController.bookList(req, res);
});

//BuyBook
app.post('/buyBook', async function(req, res) {
    logger.debug('==================== Buy Book ==================');
    console.log(req.body);
    await bookController.buyBook(req, res);
});

//SubmitQuestion
app.post('/submitQuestion', async function(req, res) {
    logger.debug('==================== Submit Question ==================');
    console.log(req.body);
    await questionController.submitQuestion(req, res);
});

//QuestionList
app.post('/questionList', async function(req, res) {
    logger.debug('==================== Question List ==================');
    console.log(req.body);
    await questionController.questionList(req, res);
});

//QuestionInfo
app.post('/questionInfo', async function(req, res) {
    logger.debug('==================== Question Info ==================');
    console.log(req.body);
    await questionController.questionInfo(req, res);
});

//AnswerList
app.post('/answerList', async function(req, res) {
    logger.debug('==================== Answer List ==================');
    console.log(req.body);
    await questionController.answerList(req, res);
});

//Answer
app.post('/answer', async function(req, res) {
    logger.debug('==================== Answer ==================');
    console.log(req.body);
    await questionController.answer(req, res);
});

//BestAnswer
app.post('/bestAnswer', async function(req, res) {
    logger.debug('==================== Best Answer ==================');
    console.log(req.body);
    await questionController.bestAnswer(req, res);
});

//ArbitratedQuestion
app.post('/arbitratedQuestion', async function(req, res) {
    logger.debug('==================== Arbitrated Question ==================');
    console.log(req.body);
    await arbitrationController.arbitratedQuestion(req, res);
});

//ArbitratedList
app.post('/arbitratedList', async function(req, res) {
    logger.debug('==================== Arbitrated List ==================');
    console.log(req.body);
    await arbitrationController.arbitratedList(req, res);
});

//SubmitArbitration
app.post('/submitArbitration', async function(req, res) {
    logger.debug('==================== Submit Arbitration ==================');
    console.log(req.body);
    await arbitrationController.submitArbitration(req, res);
});

//ArbitrationInfo
app.post('/arbitrationInfo', async function(req, res) {
    logger.debug('==================== Arbitration Info ==================');
    console.log(req.body);
    await arbitrationController.arbitrationInfo(req, res);
});

//Vote
app.post('/vote', async function(req, res) {
    logger.debug('==================== Vote ==================');
    console.log(req.body);
    await arbitrationController.vote(req, res);
});

//CheckArbitration
app.post('/checkArbitration', async function(req, res) {
    logger.debug('==================== Check Arbitration ==================');
    console.log(req.body);
    await arbitrationController.checkArbitration(req, res);
});


