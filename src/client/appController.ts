import { AuthService } from './services/authService';
import { ProjectService } from './services/projectService';
import { Viewer } from 'viewer';
import { BloxHubExtension } from 'extensions/bloxhubExtension';

import * as vis from 'vis-timeline';

export class AppController {
    private _authService: AuthService;
    private _projectService: ProjectService;
    private _btnLoad: JQuery;
    private _btnRooms: JQuery;
    private _btnSensors: JQuery;
    private _lstProject: JQuery;
    private _lstRoom: JQuery;
    private _viewerContainer: JQuery;
    private _sensorDataContainer: JQuery;
    private _sensorChartContainer: JQuery;
    private _viewer: Viewer;
    private _extension: BloxHubExtension;
    private _chart: any;
    private _sensorID: number;

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
        this._sensorDataContainer = $('#sensor-data-container');
        this._sensorChartContainer = $('#sensor-chart-container');
        this._viewerContainer = $('#viewer-container');
        this._viewer = new Viewer(this._viewerContainer[0], this._authService);
        // populate projects
        const projects = await this._projectService.getProjects();

        projects.forEach((p) => {
            this._lstProject.append(
                $('<option/>')
                    .val(p.id)
                    .text(p.name)
            );
        });
        this.pollSensorData();
    }

    private get extension(): BloxHubExtension {
        if (!this._extension) {
            this._extension = this._viewer.getExtension(BloxHubExtension.NAME) as BloxHubExtension;
            this._extension.addEventListener('SENSOR_SELECTED', (e) => {
                this.onSensorSelected(e);
            });
        }
        return this._extension;
    }

    private async onLoadClick() {
        const projectID = this._lstProject[0]['value'];
        const projectData = await this._projectService.getProject(projectID);

        // display model
        await this._viewer.initialize();
        await this._viewer.load(`urn:${projectData.urn}`);
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

    private async onSensorSelected(e): Promise<void> {
        console.debug(`sensorSelected: ${e.id}`);
        this.refreshSensorData(e.id);
    }

    private pollSensorData(): void {
        setTimeout(() => {
            this.refreshSensorData(this._sensorID);
            this.pollSensorData();
        }, 5000);
    }

    private async refreshSensorData(sensorID: number): Promise<void> {
        let data;

        if (sensorID) {
            data = await this._projectService.getSensor(sensorID);
        }
        this._sensorDataContainer.empty();
        if (sensorID) {
            const sensorRow = $(`
                <div class='sensor-data-row'>
                    <span>Sensor</span>
                    <span>${sensorID}</span>
                </div>`);

            this._sensorDataContainer.append(sensorRow);
        }
        if (data && data.length) {
            const latestValues = data[0];
            const temperatureRow = $(`
                <div class='sensor-data-row'>
                    <span>Temperature</span>
                    <span>${latestValues.data.temperature}</span>
                </div>`);

            this._sensorDataContainer.append(temperatureRow);
        }
        // populate chart
        const chartGroups = new vis.DataSet();

        chartGroups.add({
            id: 0,
            content: 'Humidity',
            className: 'vis-graph-group0',
            style: 'vis-graph-group0'
        });
        chartGroups.add({
            id: 1,
            content: 'Light',
            className: 'vis-graph-group0',
            style: 'vis-graph-group0'
        });
        chartGroups.add({
            id: 2,
            content: 'Temperature',
            className: 'vis-graph-group0',
            style: 'vis-graph-group0'
        });
        const chartValues = data?.map((i) => {
            return {
                humidity: i.data.humidity,
                light: i.data.light,
                temperature: i.data.temperature
            };
        }).reverse();
        const items = [];

        chartValues?.forEach((v, index) => {
            items.push({
                x: index,
                y: v.humidity,
                group: 0
            });
            items.push({
                x: index,
                y: v.light * 0.1,
                group: 1
            });
            items.push({
                x: index,
                y: v.temperature,
                group: 2
            });
        });
        const chartData = new vis.DataSet(items);

        if (!this._chart && chartValues) {
            const options = {
                clickToUse: false,
                dataAxis: {
                    showMinorLabels: false
                },
                drawPoints: false,
                legend: false,
                start: 0,
                end: chartValues.length - 1,
                height: '200px',
                width: '300px',
                showMajorLabels: false,
                showMinorLabels: false,
                zoomable: false
            };

            this._chart = new vis.Graph2d(this._sensorChartContainer[0], chartData, chartGroups, options);
        } else {
            this._chart?.setGroups(chartGroups);
            this._chart?.setItems(chartData);
        }
        this._sensorID = sensorID;
    }
}
