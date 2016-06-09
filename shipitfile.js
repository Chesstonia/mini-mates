module.exports = function (shipit) {
    require('shipit-deploy')(shipit);

    var path = '/var/www/mini-mates'

    shipit.initConfig({
	default: {
		workspace: '/tmp/temp',
		deployTo: path,
		repositoryUrl: '~/workspace/code/javascript/mini-mates',
		ignores: ['.git'],
		keepReleases: 2,
		deleteOnRollback: false,
		key: '/Users/andrew/Dropbox/andrew/bots.pem',
		shallowClone: true
	},
	production: {
		servers: 'ubuntu@ec2-54-211-213-225.compute-1.amazonaws.com'
	}
    });
    
    shipit.on('deployed', function(){
	    shipit.remote('forever start ' + path + '/current/forever/mini-mates.json');
    });
    
    shipit.on('deploy', function(){
	    shipit.remote('forever stop ' + path + '/current/forever/mini-mates.json');
    });
};