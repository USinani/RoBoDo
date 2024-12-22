export function setLogger(logger) {
    return async (c, next) => {
        c.set('logger', logger.child({
            requestId: c.get('requestId'),
        }));
        await next();
    };
}
//# sourceMappingURL=logger.js.map