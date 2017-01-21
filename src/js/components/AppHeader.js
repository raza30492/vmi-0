import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localeData } from '../reducers/localization';

import Title from 'grommet/components/Title';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Button from 'grommet/components/Button';
import MenuIcon from "grommet/components/icons/base/Menu";

import { navActivate } from '../actions';

class AppHeader extends Component {

  constructor () {
    super();
    this._openMenu = this._openMenu.bind(this);
  }

  componentWillMount () {
    this.setState({localeData: localeData()});
  }

  _openMenu () {
    this.props.dispatch(navActivate(true));
  }

  _logout () {
    sessionStorage.token = null;
    sessionStorage.username = null;
    sessionStorage.role = null;
    sessionStorage.buyerName = null;
    sessionStorage.buyerHref = null;
    this.props.dispatch(navActivate(false));
  }

  render () {
    const { active: navActive } = this.props.nav;
    const { username, token, role } = window.sessionStorage;
    let rol;
    if (token != null) {
      rol = role.charAt(0) + role.substring(1,role.length).toLowerCase();
    }

    let login = null;
    if (!(token == null || token == 'null')) {
      login = (

        <Menu direction="row" align="center" responsive={false}>
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
      </Header>
    );
  }
}
//
// AppHeader.contextTypes = {
//   router : React.PropTypes.object.isRequired
// }

let select = (store) => {
  return { nav: store.nav, user: store.user};
};

export default connect(select)(AppHeader);
