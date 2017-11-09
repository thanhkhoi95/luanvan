import * as express from 'express';
import { IError, ISuccess, cryptoUtils, tokenSign } from '../shared';
import { userDao, staffDao, tableDao, kitchenDao } from '../dao';
import { IUser, IUserModel, IStaff } from '../models';
import config from '../config';

function login(request: express.Request): Promise<ISuccess | IError> {
    if (!request.body.username || !request.body.password) {
        const error: IError = {
            statusCode: 400,
            message: 'Data fields missing.'
        };
        return Promise.reject(error);
    }
    if (request.body.username === config.admin.username &&
        request.body.password === config.admin.password) {
        const tokenObject = {
            role: 'admin'
        };
        const promise = new Promise<ISuccess | IError>((resolve, reject) => {
            tokenSign(tokenObject, (err, token) => {
                if (!err) {
                    resolve({
                        message: 'Login successfully.',
                        data: {
                            info: {
                                role: 'admin'
                            },
                            token: token
                        }
                    });
                } else {
                    reject({
                        statusCode: 500,
                        message: 'Internal server error.'
                    });
                }
            });
        });
        return promise;
    }
    return userDao.checkPassword(request.body.username, request.body.password)
        .then(
        (flag) => {
            if (flag) {
                return userDao.getUser(request.body.username)
                    .then(
                    (user) => {
                        if (user.role === 'staff') {
                            return staffDao.getPopulatedStaffByUserId(user.id)
                                .then(
                                (staff) => {
                                    if (staff.active === false) {
                                        return Promise.reject({
                                            statusCode: 400,
                                            message: 'Wrong username or password.'
                                        });
                                    }
                                    staff.role = 'staff';
                                    const tokenObject = {
                                        role: 'staff',
                                        ownerId: staff.id,
                                        userId: user.id,
                                        username: user.username
                                    };
                                    const promise = new Promise<ISuccess | IError>((resolve, reject) => {
                                        tokenSign(tokenObject, (err, token) => {
                                            if (!err) {
                                                resolve({
                                                    message: 'Login successfully.',
                                                    data: {
                                                        info: staff,
                                                        token: token
                                                    }
                                                });
                                            } else {
                                                reject({
                                                    statusCode: 500,
                                                    message: 'Internal server error.'
                                                });
                                            }
                                        });
                                    });
                                    return promise;
                                }
                                )
                                .catch(
                                error => Promise.reject(error)
                                );
                        } else if (user.role === 'table') {
                            return tableDao.getPopulatedTableByUserId(user.id)
                                .then(
                                (table) => {
                                    if (table.active === false) {
                                        return Promise.reject({
                                            statusCode: 400,
                                            message: 'Wrong username or password.'
                                        });
                                    }
                                    table.role = 'table';
                                    const tokenObject = {
                                        role: 'table',
                                        ownerId: table.id,
                                        userId: user.id,
                                        username: user.username
                                    };
                                    const promise = new Promise<ISuccess | IError>((resolve, reject) => {
                                        tokenSign(tokenObject, (err, token) => {
                                            if (!err) {
                                                resolve({
                                                    message: 'Login successfully.',
                                                    data: {
                                                        info: table,
                                                        token: token
                                                    }
                                                });
                                            } else {
                                                reject({
                                                    statusCode: 500,
                                                    message: 'Internal server error.'
                                                });
                                            }
                                        });
                                    });
                                    return promise;
                                }
                                )
                                .catch(
                                error => Promise.reject(error)
                                );
                        } else if (user.role === 'kitchen') {
                            return kitchenDao.getPopulatedKitchenByUserId(user.id)
                                .then(
                                (kitchen) => {
                                    if (kitchen.active === false) {
                                        return Promise.reject({
                                            statusCode: 400,
                                            message: 'Wrong username or password.'
                                        });
                                    }
                                    kitchen.role = 'kitchen';
                                    const tokenObject = {
                                        role: 'kitchen',
                                        ownerId: kitchen.id,
                                        userId: user.id,
                                        username: user.username
                                    };
                                    const promise = new Promise<ISuccess | IError>((resolve, reject) => {
                                        tokenSign(tokenObject, (err, token) => {
                                            if (!err) {
                                                resolve({
                                                    message: 'Login successfully.',
                                                    data: {
                                                        info: kitchen,
                                                        token: token
                                                    }
                                                });
                                            } else {
                                                reject({
                                                    statusCode: 500,
                                                    message: 'Internal server error.'
                                                });
                                            }
                                        });
                                    });
                                    return promise;
                                }
                                )
                                .catch(
                                error => Promise.reject(error)
                                );
                        }
                    }
                    )
                    .catch(
                    error => Promise.reject(error)
                    );
            } else {
                return Promise.reject({
                    statusCode: 400,
                    message: 'Wrong username or password.'
                });
            }
        }
        )
        .catch(
        error => Promise.reject(error)
        );
}

export const authController = {
    login: login
};
