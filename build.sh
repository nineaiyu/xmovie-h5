#!/bin/bash
#
#
# clean old build docker and image
docker rm -f xmovie-h5-build
docker image rm xmovie-h5-build

# build web
docker compose up xmovie-h5-build
