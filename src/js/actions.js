import { handleErrors, headers} from './utils/restUtil';

/////////////////////////  Navigation ////////////////////////////////////////////////////
export const NAV_ACTIVATE = 'NAV_ACTIVATE';

export function navActivate (active) {
  return { type: NAV_ACTIVATE, active: active};
}

////////////////////////////////////////  FIT  ///////////////////////////////////////////
export const FIT_FETCH_PROGRESS = 'FIT_FETCH_PROGRESS';
export const FIT_FETCH_SUCCESS = 'FIT_FETCH_SUCCESS';
export const FIT_FETCH_FAIL = 'FIT_FETCH_FAIL';
export const FIT_ADD_SUCCESS = 'FIT_ADD_SUCCESS';
export const FIT_ADD_FAIL = 'FIT_ADD_FAIL';
export const FIT_EDIT_SUCCESS = 'FIT_EDIT_SUCCESS';
export const FIT_EDIT_FAIL = 'FIT_EDIT_FAIL';
export const FIT_REMOVE_SUCCESS = 'FIT_REMOVE_SUCCESS';
export const FIT_REMOVE_FAIL = 'FIT_REMOVE_FAIL';
export const TOGGLE_FIT_ADD_FORM = 'TOGGLE_FIT_ADD_FORM';
export const TOGGLE_FIT_EDIT_FORM = 'TOGGLE_FIT_EDIT_FORM';

export function getFits () {
  return function (dispatch) {
    dispatch({type:FIT_FETCH_PROGRESS});
    const options = {method: 'GET', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(window.serviceHost + '/fits', options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      let fits = data._embedded.fits.map(fit => {
        return { href: fit._links.self.href, name: fit.name};
      });
      dispatch({type: FIT_FETCH_SUCCESS, payload: {fits: fits}});
    })
    .catch(error => {
      console.log(error);
      dispatch({type: FIT_FETCH_FAIL});
    });
  };
}

export function addFit (fit) {
  return function (dispatch) {
    const options = {method: 'POST', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(fit)};
    fetch(window.serviceHost + '/fits', options)
    .then(handleErrors)
    .then((response) => {
      if (response.status == 409) {
        alert('Duplicate Entry!');
      }else{
        response.json().then((data)=>{
          dispatch({type: FIT_ADD_SUCCESS,payload: {fit: {href: data._links.self.href, name: data.name}}});
        });
      }
    })
    .catch(error => {
      console.log(error);
      dispatch({type: FIT_ADD_FAIL});
    });
  };
}

export function editFit (url, fit) {
  return function (dispatch) {
    const options = {method: 'PUT', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(fit)};
    fetch(url, options)
    .then(handleErrors)
    .then((response) => {
      if (response.status == 409) {
        alert('Duplicate Entry!');
      }else{
        response.json().then((data)=>{
          dispatch({type: FIT_EDIT_SUCCESS,payload: {fit: {href: data._links.self.href, name: data.name}}});
        });
      }
    })
    .catch(error => {
      console.log(error);
      dispatch({type: FIT_EDIT_FAIL});
    });
  };
}

export function removeFit (url) {
  return function (dispatch) {
    const options = {method: 'DELETE', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(url, options)
    .then(handleErrors)
    .then(response => {
      if (response.status == 204 || response.status == 200) {
        dispatch({type: FIT_REMOVE_SUCCESS, payload: {href: url}});
      }else{
        console.log(response);
      }
    })
    .catch(error => {
      console.log(error);
    });
  };
}

////////////////////////////////////////  BUYER  ///////////////////////////////////////////
export const BUYER_FETCH_PROGRESS = 'BUYER_FETCH_PROGRESS';
export const BUYER_FETCH_SUCCESS = 'BUYER_FETCH_SUCCESS';
export const BUYER_FETCH_FAIL = 'BUYER_FETCH_FAIL';
export const BUYER_ADD_SUCCESS = 'BUYER_ADD_SUCCESS';
export const BUYER_ADD_FAIL = 'BUYER_ADD_FAIL';
export const BUYER_EDIT_SUCCESS = 'BUYER_EDIT_SUCCESS';
export const BUYER_EDIT_FAIL = 'BUYER_EDIT_FAIL';
export const BUYER_REMOVE_SUCCESS = 'BUYER_REMOVE_SUCCESS';
export const BUYER_REMOVE_FAIL = 'BUYER_REMOVE_FAIL';
export const TOGGLE_BUYER_ADD_FORM = 'TOGGLE_BUYER_ADD_FORM';
export const TOGGLE_BUYER_EDIT_FORM = 'TOGGLE_BUYER_EDIT_FORM';


export function getBuyers () {
  return function (dispatch) {
    dispatch({type:BUYER_FETCH_PROGRESS});

    const options = {method: 'GET', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(window.serviceHost + '/buyers', options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      let buyers = data._embedded.buyers.map(buyer => {
        return { href: buyer._links.self.href, name: buyer.name};
      });
      dispatch({type: BUYER_FETCH_SUCCESS, payload: {buyers: buyers}});
    })
    .catch(error => {
      console.log(error);
      dispatch({type: BUYER_FETCH_FAIL});
    });
  };
}

export function addBuyer (buyer) {
  return function (dispatch) {
    const options = {method: 'POST', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(buyer)};
    fetch(window.serviceHost + '/buyers', options)
    .then(handleErrors)
    .then((response) => {
      if (response.status == 409) {
        alert('Duplicate Entry!');
      }else{
        response.json().then((data)=>{
          dispatch({type: BUYER_ADD_SUCCESS,payload: {buyer: {href: data._links.self.href, name: data.name}}});
        });
      }
    })
    .catch(error => {
      console.log(error);
      dispatch({type: BUYER_ADD_FAIL});
    });
  };
}

export function editBuyer (url, buyer) {
  return function (dispatch) {
    const options = {method: 'PUT', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(buyer)};
    fetch(url, options)
    .then(handleErrors)
    .then((response) => {
      if (response.status == 409) {
        alert('Duplicate Entry!');
      }else{
        response.json().then((data)=>{
          dispatch({type: BUYER_EDIT_SUCCESS,payload: {buyer: {href: data._links.self.href, name: data.name}}});
        });
      }
    })
    .catch(error => {
      console.log(error);
      dispatch({type: BUYER_EDIT_FAIL});
    });
  };
}

export function removeBuyer (url) {
  return function (dispatch) {
    const options = {method: 'DELETE', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(url, options)
    .then(handleErrors)
    .then(response => {
      if (response.status == 204 || response.status == 200) {
        dispatch({type: BUYER_REMOVE_SUCCESS, payload: {href: url}});
      }else{
        console.log(response);
      }
    })
    .catch(error => {
      console.log(error);
    });
  };
}


////////////////////////////////////////  User  ///////////////////////////////////////////
export const AUTH_PROGRESS = 'AUTH_PROGRESS';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_FAIL = 'AUTH_FAIL';

export function authenticate (credential) {
  return function (dispatch) {
    dispatch({type:AUTH_PROGRESS});
    const options = {method: 'post', headers: headers, body: JSON.stringify(credential)};
    fetch(window.serviceHost + "/emps/logon", options)
    .then(handleErrors)
    .then((response)=>{
      if (response.status == 200) {
        response.json().then((data)=>{
          sessionStorage.token = data.token;
          sessionStorage.username = data.username;
          sessionStorage.role = data.role;
          sessionStorage.buyerName = data.buyerName;
          sessionStorage.buyerHref = data.buyerHref;
          dispatch({type: AUTH_SUCCESS});
        });
      } else if (response.status == 401) {
        dispatch({type: AUTH_FAIL, payload: {error: ['Incorrect Username or Password.']}});
      }
    })
    .catch(error=>{
      console.log(error);
      dispatch({type: AUTH_FAIL, payload: {error: ['Some Error occured. Try again later.']}});
    });
  };
}
