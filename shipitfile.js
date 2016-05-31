module.exports = function (shipit) {
    require('shipit-deploy')(shipit);

    shipit.initConfig({
	default: {
		workspace: '/tmp/temp',
		    deployTo: '/var/www/mini-mates',
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
};