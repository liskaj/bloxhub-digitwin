import { ServiceClient  } from './serviceClient';

export class AuthService extends ServiceClient {
    public createViewToken(): Promise<any> {
        const url = `api/services/auth/viewtoken`;

        return this.post(url);
    }
}
