/**
 * Created by razamd on 10/22/2016.
 */
import { NAV_ACTIVATE } from "../actions";

const initialState = {
  active: false,
  itemsAdmin:[
    { path: '/', label: 'Home'},
    { path: '/buyer', label: 'Buyer'},
    { path: '/user', label: 'User'}
  ],
  items:[
    { path: '/', label: 'Home'},
    { path: '/fit', label: 'Fit'},
    { path: '/sku', label: 'SKU'},
    { path: '/sales', label: 'Sales Data'},
    { path: '/proposal', label: 'Proposal'},
    { path: '/template', label: 'Template'}
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
