Armeria
=======

This is the main repository for Armeria. Please keep everything secret unless told otherwise.

Local Development
-----------------

### Requirements

* Git - http://git-scm.com
* Vagrant - http://vagrantup.com
* VirtualBox - http://virtualbox.org

### Intro

For local development, we use [Vagrant](http://www.vagrantup.com). This allows us to replicate
the same testing environment on every computer. 

### Working

Once Vagrant is installed and the repo is cloned, run the following commands:

    vagrant up

The first time you run this, the virtual box image will be downloaded and installed. Then,
Vagrant will set up the development environment.

After the development environment is up and running, you can ssh into the box by running
the command:

    vagrant ssh

You should note that all of your repository files are stored at `/vagrant` and they automatically
sync to your repository on your local computer. **Only make git changes locally, and not from the
virtual box!**

### Server Management

Now that you have everything up and running, you must grab some data for your local server. To do
this, you can run the following command (from any directory) which will grab all of the data from
the live server and put it in `/vagrant/server/data`:

    curl http://tools.playarmeria.com/fetchLiveData.sh | sh
    
OR

    /vagrant/bin/getdata

**Note:** Be sure to keep the `data` directory out of the repository. Never, ever add it!

You can now start up the server. To do so, you have two choices. You can run it in non-daemon mode:

    cd /vagrant/server
    ./app nodaemon

or you can run it in the background:

    cd /vagrant/server
    ./app start

and, if it's running the background, you can stop it with:

    cd /vagrant/server
    ./app stop

## Accessing the Server

Now that the server is running, you can access it from your local machine by going here:

http://local.playarmeria.com:8080/

You don't have to add anything to your HOSTS (or equivalent) file since the DNS entry for
`local.playarmeria.com` points to `127.0.0.1`.

## Adding Changes

Once you've added a few changes, open up a pull request and let [Mike Du Russel](https://github.com/ethryx) know. If
everything looks good, we'll go ahead and pull it into `live`.

When pull requests are merged, Jenkins will automatically shut down the live server, add your changes and start
the server back up. We'll be sure to warn everyone on the game before this takes place.

Furthermore, if the client files are updated (namely index.html and engine.js), the client will warn the user to
refresh the page.