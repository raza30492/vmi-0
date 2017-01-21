import React, {Component} from 'react';
import { connect } from 'react-redux';
import { getBuyers } from '../actions';
import { ROLE_MERCHANT } from '../utils/util';
import { localeData } from '../reducers/localization';
//import history from '../history';

import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Section from 'grommet/components/Section';
import Select from 'grommet/components/Select';
import Toast from 'grommet/components/Toast';

class Dashboard extends Component {
  constructor () {
	  super();
    this.state = {
      message: "You do not have access to any buyer. You will have 'USER' privilage until buyer access is granted by administrator.",
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
    console.log(role);
    console.log(privilege);
    if (privilege == 'USER') {
      if (role == ROLE_MERCHANT) {
        this.setState({showToast: true});
      }
      if (!this.props.buyer.loaded) {
        this.props.dispatch(getBuyers());
      }
      if (buyerName != 'undefined') {
        this.setState({buyerName: buyerName});
      }
    }
  }

  _onBuyerFilter (event) {
    let buyerName = event.value;
    const { buyers } = this.props.buyer;
    const buyer = buyers.find(buyer => buyer.name == buyerName);
    window.sessionStorage.buyerName = buyer.name;
    window.sessionStorage.buyerHref = buyer.href;
    this.setState({buyerName: buyerName});
  }

  _onCloseToast () {
    this.setState({showToast: false});
  }

  render () {
    const { showToast, buyerName, message, localeData } = this.state;
    const { buyers } = this.props.buyer;
    const buyerItems = buyers.map(buyer => buyer.name);

    const filter = sessionStorage.privilege != 'USER' ? null : <Box size='small' alignSelf='center'><Select options={buyerItems} value={buyerName} onChange={this._onBuyerFilter.bind(this)}/></Box>;

    const toast = !showToast ? null :<Toast status="warning" onClose={this._onCloseToast.bind(this)}>{message}</Toast>;
    return (
		  <Box>
		    <AppHeader page={localeData.label_home} />
        <Section>
          <Box alignSelf="center">
            {toast}
            <h1>Welcome to Vendor Managed Inventory Application!</h1>
            {filter}
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
