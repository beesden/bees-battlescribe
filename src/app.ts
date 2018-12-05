import * as express from 'express';
import {importService} from './data/import.service';

class App {
    public express;

    constructor() {
        this.express = express();
        this.mountRoutes();
    }

    private mountRoutes(): void {
        const router = express.Router();

        router.get('/', async (req, res) => {
            const army = await importService.loadArmyData('wh40k', 'Imperium - Space Marines');
            res.json(army);
        });

        this.express.use('/', router);
    }
}

export default new App().express;
