import Buyer from './components/Buyer';
import Dashboard from "./components/Dashboard";
import Fit from './components/Fit';
import Main from "./components/Main";
import SKU from './components/SKU';
import User from './components/User';
import Logon from './components/Logon';

export default {
  path: '/',
  component: Main,
  indexRoute: {component: Dashboard},
  childRoutes: [
    { path: 'logon', component: Logon},
    { path: 'user', component: User},
    { path: 'buyer', component: Buyer},
    { path: 'fit', component: Fit},
    { path: 'sku', component: SKU}
  ]
};
