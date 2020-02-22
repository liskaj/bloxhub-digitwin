import { ServiceClient } from './serviceClient';

export class ProjectService extends ServiceClient {
    public getProject(projectID: string): Promise<any> {
        const url = `api/services/project/projects/${projectID}`;

        return this.get(url);
    }

    public getProjects(): Promise<any> {
        const url = `api/services/project/projects`;

        return this.get(url);
    }

    public getSensors(): Promise<any> {
        const url = `api/services/project/sensors`;

        return this.get(url);
    }
}
