import { ServiceBase } from './serviceBase';
import { StatusCodes } from './statusCodes';

export class ProjectService extends ServiceBase {
    constructor(options) {
        super(options);
    }

    protected initializeRoutes(): void {
        this.router.get('/projects', (req, res) => {
            this.getProjects(req, res);
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

    private async getSensors(req, res) {
        try {
            const data = await this.readData(`${__dirname}/data/sensor.json`);

            res.status(StatusCodes.OK).json(data);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }
}
