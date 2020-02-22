import * as forge from 'forge-apis';

import { ServiceBase } from './serviceBase';
import { StatusCodes } from './statusCodes';

export class AuthService extends ServiceBase {
    private _auth: forge.AuthClientTwoLegged;

    constructor(options) {
        super(options);
    }

    public async createToken(): Promise<any> {
        if (!this._auth) {
            this._auth = new forge.AuthClientTwoLegged(this.options.clientID,
                this.options.clientSecret,
                [ 'viewables:read' ],
                true);
        }
        if (!this._auth.isAuthorized()) {
            await this._auth.authenticate();
        }
        const token = this._auth.getCredentials();

        return token;
    }

    protected initializeRoutes(): void {
        this.router.post('/viewtoken', (req, res) => {
            this.createViewToken(req, res);
        });
    }

    private async createViewToken(req, res) {
        try {
            const token = await this.createToken();

            res.status(StatusCodes.OK).json(token);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }
}
