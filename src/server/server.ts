import * as express from 'express';
import * as bodyParser from 'body-parser';

import { AuthService } from './authSvc';
import { ProjectService } from './projectSvc';

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use('/', express.static(`${__dirname}/../../app`));

const options = {
    clientID: process.env.FORGE_CLIENT_ID,
    clientSecret: process.env.FORGE_CLIENT_SECRET
};

// services
const authSvc = new AuthService(options);

app.use('/api/services/auth', authSvc.router);
const projectSvc = new ProjectService(options);

app.use('/api/services/project', projectSvc.router);
// listen on given port
const port = process.env.PORT || 3000;

app.set('port', port);
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
