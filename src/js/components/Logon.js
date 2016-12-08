import React, { Component } from 'react';
import { connect } from 'react-redux';

import { authenticate } from '../actions';

//Components
import LoginForm from 'grommet/components/LoginForm';
import Box from 'grommet/components/Box';
// import Box from 'grommet/components/Box';
// import Box from 'grommet/components/Box';

class Logon extends Component {
  constructor () {
    super();
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.user.loggedIn) {
      this.context.router.push('/');
    }
  }

  _login (fields) {
    const credential = {email: fields.username, password: fields.password};
    this.props.dispatch(authenticate(credential));
  }

  render () {
    const { error } = this.props.user;
    return (
      <Box pad={{horizontal: 'large'}} wrap={true}  full="vertical" texture="url(img/back.jpg)" >
        <Box style={{marginTop: 250}} align="end" justify="end" pad={{"horizontal": "large", vertical:"large", between:"large"}}>
          <Box  align="center" separator="all" justify="center" colorIndex="light-1" pad={{"horizontal": "none", vertical:"none", between:"small"}} >
            <LoginForm onSubmit={this._login.bind(this)} title="Vendor Managed Inventory"   errors={error} />
          </Box>
        </Box>
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
