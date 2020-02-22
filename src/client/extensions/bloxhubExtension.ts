export class BloxHubExtension extends Autodesk.Viewing.Extension {
    static NAME: string = 'BloxHub.Extension';

    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options?: any) {
        super(viewer, options);
    }

    public load(): boolean {
        console.debug(`bloxhub extension loaded`);
        return true;
    }

    public unload(): boolean {
        console.debug(`bloxhub extension unloaded`);
        return true;
    }

    public getRooms(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
                        if ((p.displayName === 'Category') && (p.displayValue === 'Revit Rooms')) {
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
}

// register extension
Autodesk.Viewing.theExtensionManager.registerExtension(BloxHubExtension.NAME, BloxHubExtension);
