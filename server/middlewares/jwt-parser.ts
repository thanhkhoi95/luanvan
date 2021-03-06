import * as express from 'express';
import { tokenVerify } from '../shared';

export function parseJwt(...roles: string[]) {
    return function (req: express.Request, res: express.Response, next: express.NextFunction) {
        const token = req.headers['x-access-token'].toString();
        if (token) {
            tokenVerify(token, (err, decoded) => {
                if (err) {
                    res.status(401).json({
                        message: 'Invalid User or Token'
                    });
                } else if (roles.indexOf('admin') > -1 && decoded.role === 'admin') {
                    next();
                } else {
                    req.body.authInfo = decoded;
                    for (const i in roles) {
                        if (roles[i] === 'staffEx') {
                            if (req.query.id !== decoded.staff.id) {
                                res.status(550).json({
                                    message: 'Permission denied'
                                });
                                return;
                            } else {
                                next();
                                return;
                            }
                        } else if (roles[i] === decoded.role) {
                            next();
                            return;
                        }
                    }
                    res.status(550).json({
                        message: 'Permission denied'
                    });
                    return;
                }
            });
        } else {
            res.status(401).send({
                message: 'Unauthorized.'
            });
        }
    };
}
