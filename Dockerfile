FROM node:13.12.0

EXPOSE 24001

WORKDIR /opt/r1ng

COPY ./package.json ./yarn.lock /opt/r1ng/

RUN yarn

COPY tsconfig.json src /opt/r1ng/
