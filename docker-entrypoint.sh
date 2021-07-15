#!/usr/bin/env ash
set -eo pipefail

# default variables
: "${SLEEP:=1}"
: "${TRIES:=60}"

function wait_for_database {(
  echo "Waiting for database to respond..."
  tries=0
  while true; do
    [[ $tries -lt $TRIES ]] || return
    (echo "from django.db import connection; connection.connect()" | python manage.py shell) #>/dev/null 2>&1
    [[ $? -eq 0 ]] && return
    sleep $SLEEP
    tries=$((tries + 1))
  done
)}

# first wait for the database
wait_for_database
# then migrate the database
python manage.py migrate
# then collect static files
python manage.py collectstatic --noinput
# create language files
#umap storagei18n
# compress static files
python manage.py compress
# run uWSGI
while :
do
	echo "Press [CTRL+C] to stop.."
  exec uwsgi --ini uwsgi.ini
	sleep 1
done