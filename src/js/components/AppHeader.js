import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localeData } from '../reducers/localization';

import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Layer from 'grommet/components/Layer';
import Menu from 'grommet/components/Menu';
import MenuIcon from "grommet/components/icons/base/Menu";
import Select from 'grommet/components/Select';
import Title from 'grommet/components/Title';

import { navActivate, getBuyers, getFits, LOGOUT } from '../actions';

class AppHeader extends Component {

  constructor () {
    super();
    this.state = {
      selectingBuyer: false
    };
    this._openMenu = this._openMenu.bind(this);
  }

  componentWillMount () {
    this.setState({localeData: localeData()});
    if (!this.props.buyer.loaded) {
      this.props.dispatch(getBuyers());
    }
  }

  _openMenu () {
    this.props.dispatch(navActivate(true));
  }

  _logout () {
    sessionStorage.token = undefined;
    sessionStorage.id = undefined;
    sessionStorage.username = undefined;
    sessionStorage.role = undefined;
    sessionStorage.privilege = undefined;
    sessionStorage.buyerName = undefined;
    sessionStorage.buyerHref = undefined;
    this.props.dispatch(navActivate(false));
    this.props.dispatch({type: LOGOUT });
  }

  _onBuyerFilter (event) {
    let buyerName = event.value;
    const { buyers } = this.props.buyer;
    const buyer = buyers.find(buyer => buyer.name == buyerName);
    window.sessionStorage.buyerName = buyer.name;
    window.sessionStorage.buyerHref = buyer.href;
    this.setState({selectingBuyer: false});
    this.props.dispatch(getFits(buyer.name));
  }

  _onBuyerSelectClick () {
    console.log('_onBuyerSelectClick');
    this.setState({selectingBuyer: true});
  }

  _onCloseLayer () {
    this.setState({selectingBuyer: false});
  }

  render () {
    const { active: navActive} = this.props.nav;
    const { username, token, role, privilege, buyerName } = window.sessionStorage;
    const { buyers } = this.props.buyer;
    const buyerItems = buyers.map(buyer => buyer.name);
    const selectedBuyer = ( buyerName == 'undefined') ? 'Select Buyer' : buyerName;
    let layerSelectBuyer = (
      <Layer hidden={!this.state.selectingBuyer} onClose={this._onCloseLayer.bind(this)}  closer={true} align="center">

          <Header><Heading tag="h3" strong={true}>Select Buyer</Heading></Header>
          <Box size='small' alignSelf='center'>
            <Select options={buyerItems} value={selectedBuyer} onChange={this._onBuyerFilter.bind(this)}/>
          </Box>
          <Box size='small' alignSelf='center' pad={{vertical: 'medium'}} />

      </Layer>
    );

    let rol;
    if (token != null) {
      rol = role.charAt(0) + role.substring(1,role.length).toLowerCase();
    }

    let login = null;
    const selectBuyer = (privilege == 'USER') ? <Anchor href="#" onClick={this._onBuyerSelectClick.bind(this)}>{selectedBuyer}</Anchor> : null;
    if (!(token == null || token == 'null')) {
      login = (

        <Menu direction="row" align="center" responsive={false}>
          {selectBuyer}
          <Anchor href="#">{rol}</Anchor>
          <Anchor path="/profile">{username}</Anchor>
          <Anchor path="/logon" onClick={this._logout.bind(this)}>Logout</Anchor>
        </Menu>
      );
    } else {
      login = (
        <Menu direction="row" align="center" responsive={false}>
          <Anchor path="/logon">Login</Anchor>
        </Menu>
      );
    }
    let title = null;
    if ( !navActive ) {
      title = (
        <Title>
          <Button icon={<MenuIcon />} onClick={this._openMenu} />
          {this.state.localeData.APP_NAME} -> {this.props.page}
        </Title>
      );
    }else{
      title = (<Title>{this.state.localeData.APP_NAME} -> {this.props.page}</Title>);
    }

    return (
      <Header size="large" justify="between" colorIndex="neutral-2" pad={{horizontal: "medium"}}>
        {title}
        {login}
        {layerSelectBuyer}
      </Header>
    );
  }
}
//
// AppHeader.contextTypes = {
//   router : React.PropTypes.object.isRequired
// }

let select = (store) => {
  return { nav: store.nav, user: store.user, buyer: store.buyer};
};

export default connect(select)(AppHeader);
