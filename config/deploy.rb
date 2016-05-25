# config valid only for current version of Capistrano
lock '3.5.0'

set :application, 'mini-mates'
set :repo_url, 'https://github.com/Chesstonia/mini-mates.git'

set :use_sudo, true

set :pty, true
set :ssh_options, {
  forward_agent: true,
  auth_methods: ["publickey"],
  keys: ["~/workspace/bots.pem"]
}


namespace :deploy do

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
    end
  end

end