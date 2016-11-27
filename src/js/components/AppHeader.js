import React, { Component } from 'react';
import { connect } from 'react-redux';

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

  _openMenu () {
    this.props.dispatch(navActivate(true));
  }

  render () {
    let { active: navActive } = this.props.nav;
    let title = null;
    if ( !navActive ) {
      title = (
        <Title>
          <Button icon={<MenuIcon />} onClick={this._openMenu} />
          Vendor Managed Inventory
        </Title>
      );
    }else{
      title = (<Title>Vendor Managed Inventory</Title>);
    }

    return (
      <Header size="large" justify="between" colorIndex="neutral-2" pad={{"horizontal": "medium"}}>
        {title}
        <Menu direction="row" align="center" responsive={false}>
          <Anchor href="#">
            Login
          </Anchor>

        </Menu>
      </Header>
    );
  }
}

let select = (store) => {
  return { nav: store.nav};
};

export default connect(select)(AppHeader);
