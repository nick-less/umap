FROM python:3.9.4-alpine3.13

RUN mkdir -p /srv/umap/data && \
    mkdir -p /srv/umap/uploads

ADD requirements.txt /srv/umap/requirements.txt
ADD docker-entrypoint.sh /srv/umap/docker-entrypoint.sh

RUN set -ex \
    && apk add --no-cache --virtual .build-deps libffi-dev zlib-dev jpeg-dev openssl-dev python3-dev postgresql-dev build-base \
    && python -m venv /env \
    && python -m pip install -U pip \
    && /env/bin/pip install --upgrade pip \
    && /env/bin/pip install --no-cache-dir -r /srv/umap/requirements.txt \
    && runDeps="$(scanelf --needed --nobanner --recursive /env \
        | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
        | sort -u \
        | xargs -r apk info --installed \
        | sort -u)" \
    && apk add --virtual rundeps  $runDeps \
    && apk del .build-deps \
    && apk add binutils rust openssl-dev cargo proj-dev  geos-dev gdal gdal-dev

ADD manage.py /srv/umap
ADD uwsgi.ini /srv/umap
ADD umap /srv/umap/umap
WORKDIR /srv/umap

ENV VIRTUAL_ENV /env
ENV PATH /env/bin:$PATH
ENV UMAP_SETTINGS=/srv/umap/umap/settings/docker.py 
ENV PORT=8000

EXPOSE 8000

CMD ["/srv/umap/docker-entrypoint.sh"]
