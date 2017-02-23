import React, {Component} from 'react';
import { connect } from 'react-redux';
import { localeData } from '../reducers/localization';
import { handleErrors, headers } from '../utils/restUtil';
import { authenticate } from '../actions';

import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Footer from 'grommet/components/Footer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Layer from 'grommet/components/Layer';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Section from 'grommet/components/Section';
import Spinning from 'grommet/components/icons/Spinning';

class Profile extends Component {
  constructor () {
	  super();
    this.state = {
      fetching: false,
      changingPassword: false,
      user: null,
      errors: [],
      credential: {}
    };
  }

  componentWillMount () {
    this.setState({localeData: localeData()});
    this._getUserDetails();
  }

  _getUserDetails () {
    const id = sessionStorage.id;
    this.setState({fetching: true});
    const options = {method: 'GET', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(window.serviceHost + '/employees/' + id + '?projection=inlineBuyer', options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      this.setState({user: data, fetching:false});
    })
    .catch(error => {
      console.log(error);
      this.setState({fetching: false});
    });
  }

  _changePassword () {
    const { credential, user } = this.state;

    let errors = [];
    if (credential.oldPassword == undefined || credential.oldPassword == '') {
      errors[0] = 'Old Password cannot be blank.';
    }
    if (credential.newPassword == undefined || credential.newPassword == '') {
      errors[1] = 'New Password cannot be blank.';
    }
    if (credential.confirmNewPassword == undefined || credential.confirmNewPassword == '') {
      errors[2] = 'Confirm New Password cannot be blank.';
    }
    if (credential.newPassword != credential.confirmNewPassword) {
      errors[2] = 'Passwords do not match.';
    }
    this.setState({errors: errors});
    if (errors.length != 0) {
      return;
    }

    const data = {id: sessionStorage.id, oldPassword: credential.oldPassword, newPassword: credential.newPassword};
    const options = {method: 'POST', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(data)};
    fetch(window.serviceHost + '/employees/changePassword', options)
    .then(handleErrors)
    .then(response => {
      if (response.status == 200) {
        this.props.dispatch(authenticate({email: user.email, password: credential.newPassword}));
        this.setState({changingPassword: false, errors: []});
        alert('Password changed successfully!');
      } else if (response.status == 401) {
        this.setState({errorMessage: 'Incorrect Credential, Try again!'});
      }
    })
    .catch(error => {
      console.log(error);
      this.setState({changingPassword: false});
    });
  }

  _onClick () {
    this.setState({changingPassword: true});
  }

  _onChange (event) {
    let { credential, errors } = this.state;
    if (event.target.getAttribute('name') == 'confirmNewPassword') {
      const confirmNewPassword = event.target.value;
      if (confirmNewPassword != credential.newPassword) {
        errors[2] = "Passwords do not match.";
      } else {
        errors[2] = '';
      }
    }
    credential[event.target.getAttribute('name')] = event.target.value;
    this.setState({credential: credential, errors: errors});
  }

  _onCloseLayer () {
    this.setState({changingPassword: false});
  }

  render () {
    const { fetching, changingPassword, user, errors, credential, errorMessage, localeData } = this.state;
    const loading = fetching ? (<Spinning />) : null;

    const layerChangePassword = (
      <Layer hidden={!changingPassword} onClose={this._onCloseLayer.bind(this)}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Change Password</Heading></Header>
          <h3 style={{color: 'red'}}>{errorMessage}</h3>
          <FormFields >
            <FormField label="Old Password" error={errors[0]}>
              <input type="password" name="oldPassword" value={credential.oldPassword} onChange={this._onChange.bind(this)} />
            </FormField>
            <FormField label="New Password" error={errors[1]}>
              <input type="password" name="newPassword" value={credential.newPassword} onChange={this._onChange.bind(this)} />
            </FormField>
            <FormField label="Confirm New Password" error={errors[2]}>
              <input type="password" name="confirmNewPassword" value={credential.confirmNewPassword} onChange={this._onChange.bind(this)} />
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Save" primary={true}  onClick={this._changePassword.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    const content = (user == null ? null :(
      <List>
        <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
          <span> Employee Name </span>
          <span className="secondary">{user.name}</span>
        </ListItem>
        <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
          <span> Employee Id </span>
          <span className="secondary">{user.id}</span>
        </ListItem>
        <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
          <span> Email Id </span>
          <span className="secondary">{user.email}</span>
        </ListItem>
        <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
          <span> Mobile </span>
          <span className="secondary">{user.mobile}</span>
        </ListItem>
        <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
          <span> Role </span>
          <span className="secondary">{user.role}</span>
        </ListItem>
        {user.role != 'MERCHANT' ? null:
        <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
          <span> Buyer Access </span>
          <span className="secondary">{(user.buyer != null ) ? user.buyer.name : 'No Buyer Access'}</span>
        </ListItem>}
      </List>
      )
    );

    return (
		  <Box>
		    <AppHeader page={localeData.label_profile} />
        <Section size="xlarge"  pad={{vertical: 'none', horizontal:'small'}} alignSelf="center">

          <Box size="large">
            <Box pad={{vertical: 'medium'}}>
              <Heading align="center">Welcome to Profile Page</Heading>
            </Box>
            <Box size="xsmall" alignSelf="center" pad={{horizontal:'medium'}} >
              {loading}
            </Box>
            <Box pad={{vertical: 'medium'}}>
              {content}
            </Box>
            <Box alignSelf="center"><Button label="Change Password" onClick={this._onClick.bind(this)} /></Box>
          </Box>
        </Section>
        {layerChangePassword}
			</Box>
    );
  }
}

let select = (store) => {
  return {user: store.user};
};

export default connect(select)(Profile);
