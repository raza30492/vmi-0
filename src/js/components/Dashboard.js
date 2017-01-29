import React, {Component} from 'react';
import { connect } from 'react-redux';
import { ROLE_MERCHANT, ROLE_USER } from '../utils/util';
import { localeData } from '../reducers/localization';
//import history from '../history';

import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Section from 'grommet/components/Section';
import Toast from 'grommet/components/Toast';

class Dashboard extends Component {
  constructor () {
	  super();
    this.state = {
      message: '',
      showToast: false,
      showBuyerFilter: false,
      buyerName: 'Select Buyer'
    };
  }

  componentWillMount () {
    this.setState({localeData: localeData()});

    const {token} = window.sessionStorage;
    if ((token == null )) {
      this.context.router.push('/logon');
    }
  }

  componentDidMount () {
    const { role, buyerName, privilege } = window.sessionStorage;
    if (privilege == 'USER' && (buyerName == 'undefined')) {
      if (role == ROLE_MERCHANT) {
        const message = "You need to select buyer in app header before proceeding further since you do not have buyer access.Contact Administrator for buyer access.";
        this.setState({showToast: true, message: message});
      }
      if (role == ROLE_USER) {
        const message = "You need to select buyer in app header before proceeding further.";
        this.setState({showToast: true, message: message});
      }
    }
  }

  _onCloseToast () {
    this.setState({showToast: false});
  }

  render () {
    const { showToast, message, localeData } = this.state;

    const toast = !showToast ? null :<Toast status="ok" onClose={this._onCloseToast.bind(this)}>{message}</Toast>;
    return (
		  <Box>
		    <AppHeader page={localeData.label_home} />
        <Section>
          <Box alignSelf="center">
            {toast}
            <h1>Welcome to Vendor Managed Inventory Application!</h1>
          </Box>
        </Section>
			</Box>
    );
  }
}

Dashboard.contextTypes = {
  router: React.PropTypes.object.isRequired
};

let select = (store) => {
  return { nav: store.nav, user: store.user, buyer: store.buyer};
};

export default connect(select)(Dashboard);
