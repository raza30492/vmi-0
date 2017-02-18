import React, { Component } from 'react';
import { connect } from 'react-redux';

import { authenticate } from '../actions';
import { localeData } from '../reducers/localization';
import { handleErrors} from '../utils/restUtil';

//Components
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Footer from 'grommet/components/Footer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Layer from 'grommet/components/Layer';
import Spinning from 'grommet/components/icons/Spinning';

class Logon extends Component {
  constructor () {
    super();
    this.state = {
      credential: {},
      errors: [],
      isForgot: false,
      email: '',
      changing: false  //changing password
    };
  }

  componentWillMount () {
    this.setState({localeData: localeData()});
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.user.loggedIn) {
      this.context.router.push('/');
    }
  }

  _login () {
    const { credential, localeData } = this.state;
    let errors = [];
    if (credential.email == undefined || credential.email == '') {
      errors[0] = localeData.login_email_empty;
    }
    if (credential.password == undefined || credential.password == '') {
      errors[1] = localeData.login_password_empty;
    }
    this.setState({errors: errors});
    if (errors.length != 0) {
      return;
    }
    this.props.dispatch(authenticate(credential));
  }

  _forgotPasswordClick (e) {
    e.preventDefault();
    this.setState({isForgot: true});
  }

  _forgotPassword () {
    if (this.state.email == '') {
      this.setState({errors: ['Email Id cannot be empty.']});
      return;
    }
    this.setState({changing: true,errors:[]});

    const options = {method: 'POST', headers: {}};
    fetch(window.serviceHost + '/employees/forgotPassword?email=' + this.state.email, options)
    .then(handleErrors)
    .then((response) => {
      this.setState({changing: false,isForgot:false});
      response.text().then((data) =>{
        alert(data);
      });
    })
    .catch(error => {
      this.setState({changing: false, isForgot:false});
      console.log(error);
    });
  }

  _onChange (event) {
    let { credential } = this.state;
    credential[event.target.getAttribute('name')] = event.target.value;
    this.setState({credential: credential});
  }

  _onChangeInput (e) {
    this.setState({email: e.target.value});
  }

  _onCloseLayer () {
    this.setState({isForgot: false, errors:[]});
  }

  render () {
    const { error, authProgress } = this.props.user;
    const { credential, errors, localeData, isForgot, changing } = this.state;
    const busy = changing ? <Spinning /> : null;

    const layerForgotPassword = (
      <Layer hidden={!isForgot} onClose={this._onCloseLayer.bind(this)}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Forgot Password</Heading></Header>
          <FormFields>
              <FormField label="Email Id" error={this.state.errors[0]} >
                <input type="email" value={this.state.email} onChange={this._onChangeInput.bind(this)} />
              </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button icon={busy} label="Submit" primary={true}  onClick={this._forgotPassword.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    const logging = authProgress ? <Spinning /> : null;
    return (
      <Box pad={{horizontal: 'large', vertical: "large"}} wrap={true}  full="vertical" texture="url(/vmi/static/img/cover.jpg)" >
        <Box align="end" justify="end" pad={{"horizontal": "large", vertical:"large", between:"large"}}>
          <Box size="auto"  align="center" separator="all" justify="center" colorIndex="light-1" pad={{"horizontal": "medium", vertical:"medium", between:"medium"}} >
            <Heading >Vendor Managed Inventory</Heading>
            {logging}
            <Form>
              <FormFields>
                <FormField label={localeData.login_email} error={errors[0]}>
                  <input type="text" name="email" value={credential.email} onChange={this._onChange.bind(this)} />
                </FormField>
                <FormField label={localeData.login_password} error={errors[1]}>
                  <input type="password" name="password" value={credential.password} onChange={this._onChange.bind(this)} />
                </FormField>
              </FormFields>
              <a style={{color:'blue'}} onClick={this._forgotPasswordClick.bind(this)}>Forgot password?</a>
              <p style={{color:'red'}} >{error}</p>
              <Footer pad={{"vertical": "small"}}>
                <Button label="Login" fill={true} primary={true}  onClick={this._login.bind(this)} />
              </Footer>
            </Form>
          </Box>
        </Box>
        {layerForgotPassword}
      </Box>
    );
  }
}

Logon.contextTypes = {
  router: React.PropTypes.object.isRequired
};

let select = (store) => {
  return { user: store.user };
};

export default connect(select)(Logon);
