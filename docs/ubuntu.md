# Tutorial

This tutorial will cover an installation from scratch of a uMap instance in an Ubuntu server.

You need sudo grants on this server, and it must be connected to Internet.

## Install system dependencies

    sudo apt install python3 python3-dev python3-venv wget nginx uwsgi uwsgi-plugin-python3 postgresql gcc postgis libpq-dev

*Note: nginx and uwsgi are not required for local development environment*

## Create deployment directories:

    sudo mkdir -p /srv/umap
    sudo mkdir -p /etc/umap

*You can change this path, but then remember to adapt the other steps accordingly.*


## Create a Unix user

    sudo useradd -N umap -d /srv/umap/

*Here we use the name `umap`, but this name is up to you. Remember to change it
on the various commands and configuration files if you go with your own.*


## Give umap user access to the config folder

    sudo chown umap:users /etc/umap
    sudo chown umap:users /srv/umap


## Create a postgresql user

    sudo -u postgres createuser umap


## Create a postgresql database

    sudo -u postgres createdb umap -O umap


## Activate PostGIS extension

    sudo -u postgres psql umap -c "CREATE EXTENSION postgis"


## Login as umap Unix user

    sudo -u umap -i

From now on, unless we say differently, the commands are run as `umap` user.


## Create a virtualenv and activate it

    virtualenv /srv/umap/venv --python=/usr/bin/python3.6
    source /srv/umap/venv/bin/activate

*Note: this activation is not persistent, so if you open a new terminal window,
you will need to run again this last line.*


## Install umap

    pip install umap-project


## Create a local configuration file

    wget https://raw.githubusercontent.com/umap-project/umap/master/umap/settings/local.py.sample -O /etc/umap/umap.conf

## Customize umap.conf

    nano /etc/umap/umap.conf

Change the following properties:

```
STATIC_ROOT = '/srv/umap/var/static'
MEDIA_ROOT = '/srv/umap/var/data'
```

## Create the tables

    umap migrate

## Collect the statics

    umap collectstatic

## Create a superuser

    umap createsuperuser

## Start the demo server

    umap runserver 0.0.0.0:8000

You can now go to [http://localhost:8000/](http://localhost:8000/) and try to create a map for testing.

When you're done with testing, quit the demo server (type Ctrl+C).


## Configure the HTTP API

Now let's configure a proper HTTP server.

### uWSGI

Create a file named `/srv/umap/uwsgi_params`, with this content
(without making any change on it):

```
uwsgi_param  QUERY_STRING       $query_string;
uwsgi_param  REQUEST_METHOD     $request_method;
uwsgi_param  CONTENT_TYPE       $content_type;
uwsgi_param  CONTENT_LENGTH     $content_length;

uwsgi_param  REQUEST_URI        $request_uri;
uwsgi_param  PATH_INFO          $document_uri;
uwsgi_param  DOCUMENT_ROOT      $document_root;
uwsgi_param  SERVER_PROTOCOL    $server_protocol;
uwsgi_param  REQUEST_SCHEME     $scheme;
uwsgi_param  HTTPS              $https if_not_empty;

uwsgi_param  REMOTE_ADDR        $remote_addr;
uwsgi_param  REMOTE_PORT        $remote_port;
uwsgi_param  SERVER_PORT        $server_port;
uwsgi_param  SERVER_NAME        $server_name;
```

Then create a configuration file for uWSGI:

    nano /srv/umap/uwsgi.ini

And paste this content. Double check paths and user name in case you
have customized some of them during this tutorial. If you followed all the bits of the
tutorial without making any change, you can use it as is:

```
[uwsgi]
uid = umap
gid = users
# Python related settings
# the base directory (full path)
chdir           = /srv/umap/
# umap's wsgi module
module          = umap.wsgi
# the virtualenv (full path)
home            = /srv/umap/venv

# process-related settings
# master
master          = true
# maximum number of worker processes
processes       = 4
# the socket (use the full path to be safe
socket          = /srv/umap/uwsgi.sock
# ... with appropriate permissions - may be needed
chmod-socket    = 666
stats           = /srv/umap/stats.sock
# clear environment on exit
vacuum          = true
plugins         = python3

```

### Nginx

Create a new file:

    nano /srv/umap/nginx.conf

with this content:

```
# the upstream component nginx needs to connect to
upstream umap {
    server unix:///srv/umap/uwsgi.sock;
}

# configuration of the server
server {
    # the port your site will be served on
    listen      80;
    listen   [::]:80;
    listen      443 ssl;
    listen   [::]:443 ssl;
    # the domain name it will serve for
    server_name your-domain.org;
    charset     utf-8;

    # max upload size
    client_max_body_size 5M;   # adjust to taste

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  umap;
        include     /srv/umap/uwsgi_params;
    }
}
```

Remember to adapt the domain name.

### Activate and restart the services

Now quit the `umap` session, simply by typing Ctrl+D.

You should now be logged in as your normal user, which is sudoer.

- Activate the Nginx configuration file:

        sudo ln -s /srv/umap/nginx.conf /etc/nginx/sites-enabled/umap

- Activate the uWSGI configuration file:

        sudo ln -s /srv/umap/uwsgi.ini /etc/uwsgi/apps-enabled/umap.ini

- Restart both services:

        sudo systemctl restart uwsgi nginx


Now you should access your server through your url and create maps:

    http://yourdomain.org/


Congratulations!

- - -

## Troubleshooting

- Nginx logs are in /var/log/nginx/:

        sudo tail -f /var/log/nginx/error.log
        sudo tail -f /var/log/nginx/access.log

- uWSGI logs are in /var/log/uwsgi:

        sudo tail -f /var/log/uwsgi/umap.log


## Before going live

### Add a real SECRET_KEY

In your local.py file, add a real secret and unique `SECRET_KEY`, and do
not share it.

### Remove DEMO flag

In your local.py:

    UMAP_DEMO_SITE = False
    DEBUG = False

### Configure Nginx to serve statics and uploaded files:

In your nginx config:

    location /static {
        autoindex off;
        access_log off;
        log_not_found off;
        sendfile on;
        gzip on;
        gzip_vary on;
        alias /path/to/umap/var/static/;   
    }

    location /uploads {
        autoindex off;
        sendfile on;
        gzip on;
        gzip_vary on;
        alias /path/to/umap/var/data/;
        # Exclude direct acces to geojson, as permissions must be
        # checked py django.
        location /uploads/datalayer/ { return 404; }
    }

### Configure social auth

Now you can login with your superuser, but you may allow users to user social
authentication.

### Configure default map center

In your local.py change those settings:

    LEAFLET_LONGITUDE = 2
    LEAFLET_LATITUDE = 51
    LEAFLET_ZOOM = 6

### Activate statics compression

In your local.py, set `COMPRESS_ENABLED = True`, and then run the following command

    umap compress

Optionally add `COMPRESS_STORAGE = "compressor.storage.GzipCompressorFileStorage"`
and add `gzip_static on` directive to Nginx `/static` location, so Nginx will
serve pregenerated files instead of compressing them on the fly.

### Configure the site URL and short URL

In your local.py:

    SITE_URL = "http://localhost:8019"
    SHORT_SITE_URL = "http://s.hort"

Also adapt `ALLOWED_HOSTS` accordingly.

### Configure X-Accel-Redirect

In order to let Nginx serve the layer geojsons but uMap still check the permissions,
you can add this settings:

    UMAP_XSENDFILE_HEADER = 'X-Accel-Redirect'

And then add this new location in your nginx config (before the `/` location):

    location /internal/ {
        internal;
        gzip_vary on;
        gzip_static on;
        alias /path/to/umap/var/data/;
    }

### Configure ajax proxy cache

In Nginx:

- add the proxy cache

        proxy_cache_path /tmp/nginx_ajax_proxy_cache levels=1:2 keys_zone=ajax_proxy:10m inactive=60m;
        proxy_cache_key "$args";

- add this location (before the `/` location):

        location /ajax-proxy/ {
            valid_referers server_names;
            if ($invalid_referer) {
                return 400;
            }
            add_header X-Proxy-Cache $upstream_cache_status always;
            proxy_cache ajax_proxy;
            proxy_cache_valid 1m;  # Default. Umap will override using X-Accel-Expires
            gzip on;
            gzip_proxied any;
            gzip_types
                application/vnd.google-earth.kml+xml
                application/geo+json
                application/json
                application/javascript
                text/xml
                application/xml;
            uwsgi_pass umap;
            include /srv/umap/uwsgi_params;
        }



## Add more tilelayers, pictograms…

Go to the admin: [http://localhost:8020/admin/](http://localhost:8020/admin/),
and create the objects you want.

