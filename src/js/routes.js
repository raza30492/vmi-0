import Buyer from './components/Buyer';
import Dashboard from "./components/Dashboard";
import Fit from './components/Fit';
import Logon from './components/Logon';
import Main from "./components/Main";
import Profile from './components/Profile';
import Proposal from './components/Proposal';
import SalesData from './components/SalesData';
import SKU from './components/SKU';
import User from './components/User';

export default {
  path: '/',
  component: Main,
  indexRoute: {component: Dashboard},
  childRoutes: [
    { path: 'logon', component: Logon},
    { path: 'user', component: User},
    { path: 'buyer', component: Buyer},
    { path: 'fit', component: Fit},
    { path: 'sales', component: SalesData},
    { path: 'proposal', component: Proposal},
    { path: 'profile', component: Profile},
    { path: 'sku', component: SKU}
  ]
};
