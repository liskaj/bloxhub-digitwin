import { AuthService } from './services/authService';
import { ProjectService } from './services/projectService';
import { Viewer } from 'viewer';
import { BloxHubExtension } from 'extensions/bloxhubExtension';

export class AppController {
    private _authService: AuthService;
    private _projectService: ProjectService;
    private _btnLoad: JQuery;
    private _btnRooms: JQuery;
    private _lstProject: JQuery;
    private _lstRoom: JQuery;
    private _viewerContainer: JQuery;
    private _viewer: Viewer;
    private _projects: any[];
    private _project: any;
    private _ext: BloxHubExtension;

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
        if (!this._ext) {
            this._ext = this._viewer.getExtension(BloxHubExtension.NAME) as BloxHubExtension;
        }
        const rooms = await this._ext?.getRooms();

        rooms.forEach((r) => {
            this._lstRoom.append(
                $('<option/>')
                    .val(r.dbId)
                    .text(`${r.name} (${r.number})`)
            );
        });
    }
}
