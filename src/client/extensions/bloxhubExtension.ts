interface Sensor {
    id: number;
    roomID: number;
    roomNumber: string;
    location: THREE.Vector3;
}

export class BloxHubExtension extends Autodesk.Viewing.Extension {
    static NAME: string = 'BloxHub.Extension';

    private _overlays: HTMLDivElement[] = [];
    private _sensors: Sensor[] = [];
    private _dispatcher: Autodesk.Viewing.EventDispatcher;

    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any) {
        super(viewer, options);
        this._dispatcher = new Autodesk.Viewing.EventDispatcher();
    }

    public load(): boolean {
        console.debug(`bloxhub extension loaded`);
        this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, () => {
            this.onCameraChange();
        });
        return true;
    }

    public unload(): boolean {
        console.debug(`bloxhub extension unloaded`);
        return true;
    }

    public addEventListener(type: string, listener: (event: any) => void, options?: any): void {
        this._dispatcher.addEventListener(type, listener);
    }

    public removeEventListener(type: string, listener: (event: any) => void, options?: any): void {
        this._dispatcher.removeEventListener(type, listener);
    }

    public getRooms(): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            const properties = [
                'Category',
                'Name',
                'Number'
            ];

            this.viewer.model.getBulkProperties([], properties, (propResults) => {
                const result = [];

                propResults.forEach((propResult) => {
                    let name;
                    let number;
                    let isRoom: boolean = false;

                    propResult.properties.forEach((p) => {
                        if ((p.displayName === 'Category') && ((p.displayValue === 'Revit Rooms') || (p.displayValue === 'Revit Generic Models'))) {
                            isRoom = true;
                        }
                        if (p.displayCategory === 'Identity Data') {
                            if (p.displayName === 'Name') {
                                name = p.displayValue;
                            }
                            if (p.displayName === 'Number') {
                                number = p.displayValue;
                            }
                        }
                    });
                    if (isRoom) {
                        result.push({
                            dbId: propResult.dbId,
                            name: name,
                            number: number
                        });
                    }
                });
                resolve(result);
            });
        });
    }

    public showSensors(sensors: Sensor[]): void {
        this.viewer.getObjectTree((instanceTree) => {
            sensors.forEach((sensor) => {
                let overlay = this._overlays.find((o) => {
                    const id = parseInt(o.dataset['sensor']);

                    return sensor.id === id;
                });

                if (!overlay) {
                    // overlay doesn't exist - create new one
                    const pt = this.getNodeCenter(this.viewer.model, instanceTree, sensor.roomID);

                    sensor.location = pt;
                    overlay = this.createSensorOverlay(sensor);
                    overlay.addEventListener('click', (e) => {
                        this.onOverlayClick(e);
                    });
                    this._overlays.push(overlay);
                }
                // add to list
                const sensorData = this._sensors.find((s) => {
                    return s.id === sensor.id;
                });

                if (!sensorData) {
                    this._sensors.push(sensor);
                }
            });
        });
    }

    private createSensorOverlay(sensor: Sensor): HTMLDivElement {
        const clientPos = this.viewer.worldToClient(sensor.location);
        const overlayDiv: HTMLDivElement = document.createElement('div');

        overlayDiv.className = 'sensor-overlay';
        overlayDiv.style.left = `${clientPos.x}px`;
        overlayDiv.style.top = `${clientPos.y}px`;
        overlayDiv.dataset['sensor'] = sensor.id.toString();
        overlayDiv.dataset['room'] = sensor.roomID.toString();
        // add label
        const labelDiv = document.createElement('div');

        labelDiv.innerText = sensor.roomNumber;
        labelDiv.className = 'sensor-label';
        overlayDiv.appendChild(labelDiv);
        return this.viewer.container.appendChild(overlayDiv);
    }

    private getNodeCenter(model: Autodesk.Viewing.Model, instanceTree: Autodesk.Viewing.InstanceTree, id: number): THREE.Vector3 {
        const bounds = new THREE.Box3();
        const box = new THREE.Box3();
        const fragmentList = model.getFragmentList();

        instanceTree.enumNodeFragments(id, (fragId: number) => {
            fragmentList.getWorldBounds(fragId, box);
            bounds.union(box);
        }, true);
        const center = new THREE.Vector3((bounds.min.x + bounds.max.x) * 0.5,
            (bounds.min.y + bounds.max.y) * 0.5,
            (bounds.min.z + bounds.max.z) * 0.5);

        return center;
    }

    private updateOverlays(): void {
        this._overlays.forEach((overlay) => {
            const id = parseInt(overlay.dataset['sensor']);
            const sensor = this._sensors.find((item) => {
                return item.id === id;
            });

            const pos = new THREE.Vector3(sensor.location.x, sensor.location.y, sensor.location.z);
            const clientPos = this.viewer.worldToClient(pos);

            overlay.style.left = `${clientPos.x}px`;
            overlay.style.top = `${clientPos.y}px`;
        });
    }

    private onCameraChange(): void {
        this.updateOverlays();
    }

    private onOverlayClick(event): void {
        const target = $(event.currentTarget);
        const sensorId = target.data('sensor');
        const roomId = parseInt(target.data('room'));

        this.viewer.select(roomId);
        this._dispatcher.dispatchEvent({
            type: 'SENSOR_SELECTED',
            id: sensorId
        });
    }
}

// register extension
Autodesk.Viewing.theExtensionManager.registerExtension(BloxHubExtension.NAME, BloxHubExtension);
