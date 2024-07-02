import App from './App';
import Environment from './environments/environment';
import * as http from 'http';
import { setGlobalEnvironment } from './global';

const env: Environment = new Environment();
setGlobalEnvironment(env);
const app = new App();
let server: http.Server;

app.init()
  .then(() => {
    app.express.set('port', env.port);
    server = app.httpServer; 
    server.listen(env.port);
    console.log('Server started');
  })
  .catch((e) => {
    console.error('[server][init][Error]: ', e);
  });
