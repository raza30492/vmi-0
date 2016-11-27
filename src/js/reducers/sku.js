import { SKU_FETCH_PROGRESS, SKU_FETCH_SUCCESS, SKU_FETCH_FAIL, TOGGLE_SKU_ADD_FORM, SKU_ADD_SUCCESS, SKU_ADD_FAIL, SKU_REMOVE_SUCCESS, TOGGLE_SKU_EDIT_FORM, SKU_EDIT_SUCCESS, SKU_EDIT_FAIL } from "../actions";

const initialState = {
  fetching: false,
  adding: false,
  editing: false,
  skus:[]
};

const handlers = {
  [SKU_FETCH_PROGRESS]: (_, action) => ({fetching: true}),
  [SKU_FETCH_SUCCESS]: (_, action) => ({fetching: false, skus: action.payload.skus}),
  [SKU_FETCH_FAIL]: (_, action) => ({fetching: false}),
  [TOGGLE_SKU_ADD_FORM]: (_, action) => ({adding: action.payload.adding}),
  [SKU_ADD_SUCCESS]: (_, action) => {
    let skus = _.skus;
    skus.push(action.payload.sku);
    return ({adding: false, skus: skus});
  },
  [SKU_ADD_FAIL]: (_, action) => ({adding: false}),
  [TOGGLE_SKU_EDIT_FORM]: (_, action) => ({editing: action.payload.editing}),
  [SKU_EDIT_SUCCESS]: (_, action) => {
    let skus = _.skus;
    let i = skus.findIndex(e=> e.href == action.payload.sku.href);
    skus[i] = action.payload.sku;
    return ({editing: false, skus: skus});
  },
  [SKU_EDIT_FAIL]: (_, action) => ({editing: false}),
  [SKU_REMOVE_SUCCESS]: (_, action) => {
    let skus = _.skus.filter((sku)=>{
      return sku.href != action.payload.href;
    });
    return ({skus: skus});
  }
};

export default function sku (state = initialState, action) {
  let handler = handlers[action.type];
  if( !handler ) return state;
  return { ...state, ...handler(state, action) };
}
