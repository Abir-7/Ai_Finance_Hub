/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
const verifyJwt = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    }
    catch (error) {
        throw new Error(error);
    }
};
const generateToken = (payload, secret, expiresIn) => {
    try {
        const token = jwt.sign(payload, secret, {
            expiresIn,
        });
        return token;
    }
    catch (error) {
        throw new Error(error);
    }
};
export const jsonWebToken = {
    verifyJwt,
    generateToken,
};
