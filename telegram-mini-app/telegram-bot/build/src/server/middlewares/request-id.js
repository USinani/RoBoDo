import { randomUUID } from 'node:crypto';
export function requestId() {
    return async (c, next) => {
        c.set('requestId', randomUUID());
        await next();
    };
}
//# sourceMappingURL=request-id.js.map