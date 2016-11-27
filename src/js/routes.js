import Buyer from './components/Buyer';
import Dashboard from "./components/Dashboard";
import Fit from './components/Fit';
import Main from "./components/Main";
import SKU from './components/SKU';

export default {
  path: '/',
  component: Main,
  indexRoute: {component: Dashboard},
  childRoutes: [
    { path: 'buyer', component: Buyer},
    { path: 'fit', component: Fit},
    { path: 'sku', component: SKU}
  ]
};
