/**
 * Created by razamd on 10/22/2016.
 */
import { NAV_ACTIVATE } from "../actions";

const initialState = {
  active: true,
  itemsAdmin:[
    { path: '/', label: 'Dashboard'},
    { path: '/buyer', label: 'Buyer'},
    { path: '/user', label: 'User'}
  ],
  items:[
    { path: '/', label: 'Dashboard'},
    { path: '/fit', label: 'Fit'},
    { path: '/sku', label: 'SKU'}
  ]
};

export default function nav ( state = initialState, action) {

  switch ( action.type) {
    case NAV_ACTIVATE : {
      state = {...state, active: action.active};
      break;
    }
  }
  return state;
}
