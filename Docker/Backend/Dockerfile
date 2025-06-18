FROM node:22.11.0-bookworm

COPY ./tools/ .
RUN chmod +x /setup.sh

WORKDIR /backend

ENTRYPOINT [ "bash", "/setup.sh" ]
