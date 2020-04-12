FROM node:13.12.0

EXPOSE 24001

WORKDIR /opt/r1ng

COPY ./package.json /opt/r1ng/package.json
COPY ./yarn.lock yarn.lock

RUN yarn

COPY tsconfig.json /opt/r1ng/tsconfig.json
COPY src /opt/r1ng/src
