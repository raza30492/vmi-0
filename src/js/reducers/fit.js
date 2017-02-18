import { FIT_FETCH_PROGRESS, FIT_FETCH_SUCCESS, FIT_FETCH_FAIL, TOGGLE_FIT_ADD_FORM, FIT_ADD_SUCCESS, FIT_ADD_FAIL, FIT_REMOVE_SUCCESS, TOGGLE_FIT_EDIT_FORM, FIT_EDIT_SUCCESS, FIT_EDIT_FAIL, FIT_CLEAR } from "../actions";

const initialState = {
  loaded: false,
  fetching: false,
  adding: false,
  editing: false,
  fits:[]
};

const handlers = {
  [FIT_FETCH_PROGRESS]: (_, action) => ({fetching: true}),
  [FIT_FETCH_SUCCESS]: (_, action) => ({loaded: true, fetching: false, fits: action.payload.fits}),
  [FIT_FETCH_FAIL]: (_, action) => ({fetching: false}),
  [TOGGLE_FIT_ADD_FORM]: (_, action) => ({adding: action.payload.adding}),
  [FIT_ADD_SUCCESS]: (_, action) => {
    let fits = _.fits;
    fits.push(action.payload.fit);
    return ({adding: false, fits: fits});
  },
  [FIT_ADD_FAIL]: (_, action) => ({adding: false}),
  [TOGGLE_FIT_EDIT_FORM]: (_, action) => ({editing: action.payload.editing}),
  [FIT_EDIT_SUCCESS]: (_, action) => {
    let fits = _.fits;
    let i = fits.findIndex(e=> e.href == action.payload.fit.href);
    fits[i] = action.payload.fit;
    return ({editing: false, fits: fits});
  },
  [FIT_EDIT_FAIL]: (_, action) => ({editing: false}),
  [FIT_REMOVE_SUCCESS]: (_, action) => {
    let fits = _.fits.filter((fit)=>{
      return fit.href != action.payload.href;
    });
    return ({fits: fits});
  },
  [FIT_CLEAR]: (_, action) => ({loaded: false, fits: []})
};

export default function fit (state = initialState, action) {
  let handler = handlers[action.type];
  if( !handler ) return state;
  return { ...state, ...handler(state, action) };
}
