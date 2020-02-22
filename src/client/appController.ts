import { AuthService } from './services/authService';
import { ProjectService } from './services/projectService';
import { Viewer } from 'viewer';
import { BloxHubExtension } from 'extensions/bloxhubExtension';

export class AppController {
    private _authService: AuthService;
    private _projectService: ProjectService;
    private _btnLoad: JQuery;
    private _btnRooms: JQuery;
    private _btnSensors: JQuery;
    private _lstProject: JQuery;
    private _lstRoom: JQuery;
    private _viewerContainer: JQuery;
    private _viewer: Viewer;
    private _projects: any[];
    private _project: any;
    private _extension: BloxHubExtension;

    public async initialize(): Promise<void> {
        console.debug(`AppController#initialize`);
        this._authService = new AuthService();
        this._projectService = new ProjectService();
        this._lstProject = $('#project-list');
        this._lstRoom = $('#room-list');
        this._btnLoad = $('#btn-load');
        this._btnLoad.on('click', () => {
            this.onLoadClick();
        });
        this._btnRooms = $('#btn-rooms');
        this._btnRooms.on('click', () => {
            this.onRoomsClick();
        });
        this._btnSensors = $('#btn-sensors');
        this._btnSensors.on('click', () => {
            this.onSensorsClick();
        });
        this._viewerContainer = $('#viewer-container');
        this._viewer = new Viewer(this._viewerContainer[0], this._authService);
        // populate projects
        this._projects = await this._projectService.getProjects();
        this._projects.forEach((p) => {
            this._lstProject.append(
                $('<option/>')
                    .val(p.name)
                    .text(p.name)
            );
        });
    }

    private get extension(): BloxHubExtension {
        if (!this._extension) {
            this._extension = this._viewer.getExtension(BloxHubExtension.NAME) as BloxHubExtension;
        }
        return this._extension;
    }

    private async onLoadClick() {
        const projectName = this._lstProject[0]['value'];

        this._project = this._projects.find((p) => {
            return p.name === projectName;
        });
        // display model
        await this._viewer.initialize();
        await this._viewer.load(`urn:${this._project.urn}`);
    }

    private async onRoomsClick() {
        const rooms = await this.extension?.getRooms();

        rooms.forEach((r) => {
            this._lstRoom.append(
                $('<option/>')
                    .val(r.dbId)
                    .text(`${r.name} (${r.number})`)
            );
        });
    }

    private async onSensorsClick() {
        const sensorData = await this._projectService.getSensors();
        const roomData = await this.extension?.getRooms();
        const sensors = [];

        sensorData.forEach((s) => {
            const room = roomData.find((r) => {
                return r.number === s.room;
            });

            if (room) {
                sensors.push({
                    id: s.id,
                    roomID: room.dbId,
                    roomNumber: room.number
                });
            }
        });
        this.extension?.showSensors(sensors);
    }
}
