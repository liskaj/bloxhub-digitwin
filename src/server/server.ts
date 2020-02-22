import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as sequelize from 'sequelize';

import { AuthService } from './authSvc';
import { ProjectService } from './projectSvc';

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use('/', express.static(`${__dirname}/../../app`));

const options = {
    clientID: process.env.FORGE_CLIENT_ID,
    clientSecret: process.env.FORGE_CLIENT_SECRET,
    projectID: process.env.FORGE_PROJECT_ID
};

// connect to database
const conn = new sequelize.Sequelize(`mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:3306/${process.env.DB_NAME}`);

conn.authenticate().then(() => {
    // services
    const authSvc = new AuthService(options);

    app.use('/api/services/auth', authSvc.router);
    const projectSvc = new ProjectService(options, conn);

    app.use('/api/services/project', projectSvc.router);
    // listen on given port
    const port = process.env.PORT || 3000;

    app.set('port', port);
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}).catch((err) => {
    console.log(`Connection to database failed`);
});
