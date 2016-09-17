var SNS = require('sns-mobile');
var config = require('config');

console.log(config);
var SNS_KEY_ID = "AKIAJPFKQ6DYJVOHFFKA" // config.amazon.accessKeyId;
var SNS_ACCESS_KEY = "mDLFtiyL0Jb6IjaZaM2Nzte0Z3oby2rzrFIIZGM1" // config.amazon.secretAccessKey;
var ANDROID_ARN = 'arn:aws:sns:ap-southeast-1:552905730771:app/GCM/QyklyApp';
var APNS_ARN = 'arn:aws:sns:ap-southeast-1:552905730771:app/GCM/QyklyApp';
var sns = {};
sns.getARN = function(pushToken, platform, done) {


	var AndroidARN = new SNS({
		platform: 'android',
		region: config.amazon.region || 'ap-southeast-1',
		apiVersion: '2010-03-31',
		accessKeyId: SNS_KEY_ID,
		secretAccessKey: SNS_ACCESS_KEY,
		platformApplicationArn: ANDROID_ARN
	});

	var iOSARN = new SNS({
		platform: SNS.SUPPORTED_PLATFORMS.IOS,
		region: config.amazon.region || 'ap-southeast-1',
		apiVersion: '2010-03-31',
		accessKeyId: config.amazon.accessKeyId,
		secretAccessKey: config.amazon.secretAccessKey,
		platformApplicationArn: APNS_ARN,
		sandbox: (process.env.ENV == 'production') ? true : false
	});
	if (platform == "android") {
		AndroidARN.addUser(pushToken, null, function(err, endpointArn) {
			done(err, endpointArn);
		});
	} else {
		iOSARN.addUser(pushToken, null, function(err, endpointArn) {
			done(err, endpointArn);
		});
	}
}


module.exports = sns;