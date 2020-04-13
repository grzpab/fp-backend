import * as restify from "restify";

export const buildServer = (name: string) => (dal: R1NG.DataAccessLayer) : restify.Server => {
    const server = restify.createServer({ name });

    server.use(( _, res, next ) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        
        return next();
    });

    server.use(restify.plugins.acceptParser(server.acceptable));
    server.use(restify.plugins.queryParser({ mapParams: true }));
    server.use(restify.plugins.bodyParser());

    server.on("uncaughtException", (_, res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        res.send(500);
    });

    return server;
};
