import axios from 'axios';

export class ServiceClient {
    public async get(url: string, inputs?: any): Promise<any> {
        try {
            const response = await axios.get(url);

            return response.data;
        }
        catch (err) {
            return err.response.data;
        }
    }

    public async post(url: string, inputs?: any): Promise<any> {
        try {
            const response = await axios.post(url, inputs);

            return response.data;
        }
        catch (err) {
            return err.response.data;
        }
    }
}
