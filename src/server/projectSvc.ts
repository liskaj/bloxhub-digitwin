import { ServiceBase } from './serviceBase';
import { StatusCodes } from './statusCodes';
import * as forge from 'forge-apis';
import { Sequelize } from 'sequelize/types';

export class ProjectService extends ServiceBase {
    private _auth: forge.AuthClientTwoLegged;
    private _conn: Sequelize;

    constructor(options, conn) {
        super(options);
        this._conn = conn;
    }

    protected initializeRoutes(): void {
        this.router.get('/projects', (req, res) => {
            this.getProjects(req, res);
        });
        this.router.get('/projects/:id', (req, res) => {
            this.getProject(req, res);
        });
        this.router.get('/sensors', (req, res) => {
            this.getSensors(req, res);
        });
    }

    private async getProjects(req, res) {
        try {
            const data = await this.readData(`${__dirname}/data/project.json`);

            res.status(StatusCodes.OK).json(data);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }

    private async getProject(req, res) {
        try {
            const id = req.params.id;
            const token = await this.getToken();
            const url = `https://developer.api.autodesk.com/data/v1/projects/${this.options.projectID}/items/${id}`;
            const data = await this.get(token.access_token, url);
            const response = {
                id: id,
                urn: data.included[0].relationships.derivatives.data.id
            };

            res.status(StatusCodes.OK).json(response);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }

    private async getSensors(req, res) {
        try {
            const [ results ] = await this._conn.query('SELECT * from blox.coordinates');
            const data = results.map((r) => {
                return {
                    id: r.sensorid,
                    room: r.RoomDesc,
                    location: {
                        x: r.X,
                        y: r.Y,
                        z: r.Z
                    }
                };
            });

            res.status(StatusCodes.OK).json(data);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }

            res.status(StatusCodes.OK).json(data);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }

    private async getToken() {
        if (!this._auth) {
            this._auth = new forge.AuthClientTwoLegged(this.options.clientID,
                this.options.clientSecret,
                [ 'data:read' ],
                true);
        }
        if (!this._auth.isAuthorized()) {
            await this._auth.authenticate();
        }
        const token = this._auth.getCredentials();

        return token;
    }
}
