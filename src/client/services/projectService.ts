import { ServiceClient } from './serviceClient';

export interface Project {
    name: string;
    id: string;
}

export interface ProjectDetails {
    name: string;
    id: string;
    urn: string;
}

export interface SensorDetails {
    id: number;
    data: {
        temperature: number;
    };
}

export class ProjectService extends ServiceClient {
    public getProject(projectID: string): Promise<ProjectDetails> {
        const url = `api/services/project/projects/${projectID}`;

        return this.get(url);
    }

    public getProjects(): Promise<Project[]> {
        const url = `api/services/project/projects`;

        return this.get(url);
    }

    public getSensor(sensorID: number): Promise<SensorDetails[]> {
        const url = `api/services/project/sensors/${sensorID}`;

        return this.get(url);
    }

    public getSensors(): Promise<any> {
        const url = `api/services/project/sensors`;

        return this.get(url);
    }
}
