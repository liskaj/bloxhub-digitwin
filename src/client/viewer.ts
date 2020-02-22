import { AuthService } from 'services/authService';
import { BloxHubExtension } from 'extensions/bloxhubExtension';

export class Viewer extends Autodesk.Viewing.EventDispatcher {
    private _initialized: boolean = false;
    private _viewer: Autodesk.Viewing.GuiViewer3D;

    constructor(private _container: HTMLElement, private _authService: AuthService) {
        super();
    }

    public initialize(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._initialized) {
                resolve();
            } else {
                const options = {
                    getAccessToken: this.getToken.bind(this)
                };

                Autodesk.Viewing.Initializer(options, () => {
                    this._initialized = true;
                    resolve();
                });
            }
        });
    }

    public load(urn: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Autodesk.Viewing.Document.load(urn, (doc: Autodesk.Viewing.Document) => {
                const viewable = doc.getRoot().getDefaultGeometry();

                if (!this._viewer) {
                    const config = {
                        extensions: [
                            BloxHubExtension.NAME
                        ]
                    };

                    this._viewer = new Autodesk.Viewing.GuiViewer3D(this._container, config);
                }
                if (!this._viewer.started) {
                    this._viewer.start();
                }
                this._viewer.loadDocumentNode(doc, viewable).then(() => {
                    resolve();
                });
            }, (errorCode, errorMsg, errors) => {
                reject(new Error(errorMsg));
            });
        });
    }

    public getExtension(name: string): Autodesk.Viewing.Extension {
        return this._viewer.getExtension(name);
    }

    private async getToken(callback?: (token: string, expires?: number) => void): Promise<void> {
        const token = await this._authService.createViewToken();

        callback(token.access_token, token.expires_in);
    }
}
