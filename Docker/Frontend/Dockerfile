FROM node:22.11.0-bookworm

COPY ./tools/ .
RUN chmod +x /setup.sh

WORKDIR /Frontend

ENTRYPOINT [ "bash", "/setup.sh" ]
