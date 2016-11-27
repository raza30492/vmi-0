import { BUYER_FETCH_PROGRESS, BUYER_FETCH_SUCCESS, BUYER_FETCH_FAIL, TOGGLE_BUYER_ADD_FORM, BUYER_ADD_SUCCESS, BUYER_ADD_FAIL, BUYER_REMOVE_SUCCESS, TOGGLE_BUYER_EDIT_FORM, BUYER_EDIT_SUCCESS, BUYER_EDIT_FAIL } from "../actions";

const initialState = {
  loaded: false,
  fetching: false,
  adding: false,
  editing: false,
  buyers:[]
};


const handlers = {
  [BUYER_FETCH_PROGRESS]: (_, action) => ({fetching: true}),
  [BUYER_FETCH_SUCCESS]: (_, action) => ({loaded: true, fetching: false, buyers: action.payload.buyers}),
  [BUYER_FETCH_FAIL]: (_, action) => ({fetching: false}),
  [TOGGLE_BUYER_ADD_FORM]: (_, action) => ({adding: action.payload.adding}),
  [BUYER_ADD_SUCCESS]: (_, action) => {
    let buyers = _.buyers;
    buyers.push(action.payload.buyer);
    return ({adding: false, buyers: buyers});
  },
  [BUYER_ADD_FAIL]: (_, action) => ({adding: false}),
  [TOGGLE_BUYER_EDIT_FORM]: (_, action) => ({editing: action.payload.editing}),
  [BUYER_EDIT_SUCCESS]: (_, action) => {
    let buyers = _.buyers;
    let i = buyers.findIndex(e=> e.href == action.payload.buyer.href);
    buyers[i] = action.payload.buyer;
    return ({editing: false, buyers: buyers});
  },
  [BUYER_EDIT_FAIL]: (_, action) => ({editing: false}),
  [BUYER_REMOVE_SUCCESS]: (_, action) => {
    let buyers = _.buyers.filter((buyer)=>{
      return buyer.href != action.payload.href;
    });
    return ({buyers: buyers});
  }
};

export default function buyer (state = initialState, action) {
  let handler = handlers[action.type];
  if( !handler ) return state;
  return { ...state, ...handler(state, action) };
}
