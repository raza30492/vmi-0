import React, { Component } from "react";
import { connect } from 'react-redux';
import { ROLE_ADMIN } from '../utils/util';

import Sidebar from "grommet/components/Sidebar";
import Header from "grommet/components/Header";
import Title from "grommet/components/Title";
import Button from "grommet/components/Button";
import Menu from "grommet/components/Menu";
import Close from "grommet/components/icons/base/Close";
import Anchor from 'grommet/components/Anchor';

import { navActivate } from '../actions';

class NavSidebar extends Component {

  constructor () {
    super();

    this._onClose = this._onClose.bind(this);
  }


  _onClose () {
    console.log('Close Button clicked');
    this.props.dispatch(navActivate(false));
  }

  render () {
    const { items: itemsDefault, itemsAdmin } = this.props.nav;
    const { role } = window.sessionStorage;
    const items = (role == ROLE_ADMIN) ? itemsAdmin : itemsDefault;
    var links = items.map( (page, index) => {
      return (
        <Anchor key={index} path={page.path} method="push">
          {page.label}
        </Anchor>
      );
    });
    return (
      <Sidebar colorIndex="neutral-1" size="small">
        <Header pad="medium" justify="between" >
          <Title>
            VMI
          </Title>
          <Button icon={<Close />} onClick={this._onClose} />
        </Header>
        <Menu primary={true}>
          {links}
        </Menu>
      </Sidebar>
    );
  }
}

let select = (store) => {
  return { nav : store.nav, user: store.user };
};

export default connect(select)(NavSidebar);
