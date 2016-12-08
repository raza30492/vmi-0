import React, { Component } from "react";
import { connect } from 'react-redux';

import { getBuyers } from '../actions';
import { handleErrors, headers } from '../utils/restUtil';

//Components
import Add from "grommet/components/icons/base/Add";
import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Edit from "grommet/components/icons/base/Edit";
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
import Select from 'grommet/components/Select';
import Spinning from 'grommet/components/icons/Spinning';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import Trash from "grommet/components/icons/base/Trash";
import View from "grommet/components/icons/base/View";

class User extends Component {
  constructor () {
    super();
    this.state = {
      users: [],
      userSelected: -1,
      fetching: false,
      editing: false,
      adding: false,
      viewing: false,
      user: {},
      url: null,
      roles: ['USER', 'MERCHANT', 'ADMIN'],
      role: 'USER',
      showBuyerFilter: false,
      buyer: 'Select buyer access',
      errors: []
    };
    this._getUsers = this._getUsers.bind(this);
  }

  componentWillMount () {
    if (!this.props.buyer.loaded) {
      this.props.dispatch(getBuyers());
    }
    this._getUsers();
  }

  _getUsers () {
    this.setState({fetching: true});
    const options = {method: 'GET', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(window.serviceHost + '/employees', options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      let users = data._embedded.employees.map(user => {
        return {
          href: user._links.self.href,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mobile: user.mobile,
          buyer: user.buyer
        };
      });
      this.setState({users: users, fetching:false});
    })
    .catch(error => {
      console.log(error);
      this.setState({fetching: false});
    });
  }

  _addUser () {
    console.log('addSku()');
    const { user, buyer, role } = this.state;
    let errors = [];
    let isError = false;
    if (user.name == undefined || user.name == '') {
      errors[0] = 'User Name cannot be blank';
      isError = true;
    }
    if (user.id == undefined || user.id == '') {
      errors[1] = 'User Id  cannot be blank';
      isError = true;
    }
    if (user.email == undefined || user.email == '') {
      errors[2] = 'Email Id  cannot be blank';
      isError = true;
    }
    if (user.mobile == undefined || user.mobile == '') {
      errors[3] = 'mobile Number  cannot be blank';
      isError = true;
    }
    if (buyer == 'Select buyer access') {
      errors[4] = 'Select Buyer access';
      isError = true;
    }
    this.setState({errors: errors});
    if (isError) return;

    const data = { ...user, buyer: buyer, role: 'ROLE_' + role};
    console.log(data);
    const options = {method: 'POST', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(data)};
    fetch(window.serviceHost + '/emps', options)
    .then(handleErrors)
    .then((response) => {
      if (response.status == 409) {
        alert('Duplicate Entry!');
      }else{
        response.json().then((data)=>{
          this.setState({adding:false});
          this._getUsers();
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  _updateUser () {
    const { users, userSelected, role, buyer } = this.state;
    let usr = users[userSelected];

    let errors = [];
    let isError = false;
    if (usr.name == undefined || usr.name == '') {
      errors[0] = 'User Name cannot be blank';
      isError = true;
    }
    if (usr.email == undefined || usr.email == '') {
      errors[1] = 'Email Id  cannot be blank';
      isError = true;
    }
    if (usr.mobile == undefined || usr.mobile == '') {
      errors[2] = 'mobile Number  cannot be blank';
      isError = true;
    }
    this.setState({errors: errors});
    if (isError) return;

    const buyerHref = this.props.buyer.buyers.find(item=>item.name==buyer).href;
    usr = {...usr, role: role, buyer: buyerHref };
    const options = {method: 'PUT', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(usr)};
    fetch(window.serviceHost + "/employees/" + usr.id, options)
    .then(handleErrors)
    .then((response) => {
      if (response.status == 409) {
        alert('Duplicate Entry!');
      }else{
        response.json().then((data)=>{
          this.setState({editing:false,  Selected: -1});
          this._getUsers();
        });
      }
    })
    .catch(error => {
      console.log(error);
      this.setState({editing:false, userSelected: -1});
    });
  }

  _removeUser (url) {
    const options = {method: 'DELETE', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(url, options)
    .then(handleErrors)
    .then(response => {
      if (response.status == 204 || response.status == 200) {
        this._getUsers();
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  _onBuyerFilter (event) {
    this.setState({buyer: event.value});
  }

  _onRoleFilter (event) {
    const role = event.value;
    if ( role == 'MERCHANT' ) {
      this.setState({role: role, showBuyerFilter: true});
    }else{
      this.setState({role: role, showBuyerFilter: false});
    }
  }

  _onChangeInput ( event ) {
    var user = this.state.user;
    user[event.target.getAttribute('name')] = event.target.value;
    this.setState({user: user});
  }

  _onChange (event) {
    const { users, userSelected} = this.state;
    let usr = users[userSelected];
    usr[event.target.getAttribute('name')] = event.target.value;
    this.setState({users: users});
  }

  _onAddClick (type) {
    this.setState({adding: true});
  }

  _onViewClick (index) {
    this.setState({viewing: true, userSelected: index});
  }

  _onEditClick (index) {
    const { users } = this.state;
    const usr = users[index];
    console.log(usr);
    if ( usr.role == 'MERCHANT') {
      this.setState({editing: true, userSelected: index, role: usr.role, buyer: usr.buyer.name, showBuyerFilter: true});
    } else {
      this.setState({editing: true, userSelected: index, role: usr.role});
    }
  }

  _onCloseLayer (layer) {
    if( layer == 'add')
      this.setState({adding: false});
    else if (layer == 'view')
      this.setState({viewing: false, userSelected: -1});
    else if (layer == 'edit')
      this.setState({editing: false, userSelected: -1});
  }

  render () {
    const { buyers } = this.props.buyer;
    let { fetching, adding, viewing, editing, users, user, buyer, roles, role, showBuyerFilter, userSelected, errors } = this.state;
    const loading = fetching ? (<Spinning />) : null;
    const buyerItems = buyers.map(buyer=>buyer.name);
    const userItems = users.map((user, index)=>{
      return (
        <TableRow key={index}  >
          <td >{user.name}</td>
          <td >{user.role}</td>
          <td style={{textAlign: 'right', padding: 0}}>
            <Button icon={<View />} onClick={this._onViewClick.bind(this,index)} />
            <Button icon={<Edit />} onClick={this._onEditClick.bind(this,index)} />
            <Button icon={<Trash />} onClick={this._removeUser.bind(this,user.href)} />
          </td>
        </TableRow>
      );
    });
    const usr = users.length == 0 || userSelected == -1 ? {} : users[userSelected];

    const buyerAccess = showBuyerFilter ? (<FormField error={errors[4]}><Select options={buyerItems} value={buyer} onChange={this._onBuyerFilter.bind(this)}/></FormField>) : null;

    const layerAdd = (
      <Layer hidden={!adding} onClose={this._onCloseLayer.bind(this, 'add')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Add New User</Heading></Header>
          <FormFields>
            <FormField label="User Name" error={errors[0]}>
              <input type="text" name="name" value={user.name} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Employee Id" error={errors[1]}>
              <input type="text" name="id" value={user.id} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Email" error={errors[2]}>
              <input type="email" name="email" value={user.email} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Mobile Number" error={errors[3]}>
              <input type="text" name="mobile" value={user.mobile} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField>
              <Select options={roles} value={role} onChange={this._onRoleFilter.bind(this)}/>
            </FormField>
            {buyerAccess}
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Add" primary={true}  onClick={this._addUser.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    const layerView = (
      <Layer hidden={!viewing}  onClose={this._onCloseLayer.bind(this, 'view')}  closer={true} align="center">
        <Box size="medium"  pad={{vertical: 'none', horizontal:'small'}}>
          <Header><Heading tag="h3" strong={true} >User Details</Heading></Header>
          <List>
            <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
              <span> User Name </span>
              <span className="secondary">{usr.name}</span>
            </ListItem>
            <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
              <span> User Id </span>
              <span className="secondary">{usr.id}</span>
            </ListItem>
            <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
              <span> Email Id </span>
              <span className="secondary">{usr.email}</span>
            </ListItem>
            <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
              <span> Mobile </span>
              <span className="secondary">{usr.mobile}</span>
            </ListItem>
            <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
              <span> Role </span>
              <span className="secondary">{usr.role}</span>
            </ListItem>
            {usr.role != 'MERCHANT' ? null:  <ListItem justify="between" pad={{vertical:'small',horizontal:'small'}} >
            <span> Buyer Access </span>
            <span className="secondary">{usr.buyer.name}</span>
            </ListItem>}
          </List>
        </Box>
        <Box pad={{vertical: 'medium', horizontal:'small'}}></Box>
      </Layer>
    );

    const layerEdit = (
      <Layer hidden={!editing} onClose={this._onCloseLayer.bind(this, 'edit')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Update User Details</Heading></Header>
          <FormFields >
            <FormField label="Employee Id">
              <input type="text" name="id" value={usr.id} disabled onChange={this._onChange.bind(this)} />
            </FormField>
            <FormField label="User Name" error={errors[0]}>
              <input type="text" name="name" value={usr.name} onChange={this._onChange.bind(this)} />
            </FormField>
            <FormField label="Email" error={errors[1]}>
              <input type="email" name="email" value={usr.email} onChange={this._onChange.bind(this)} />
            </FormField>
            <FormField label="Mobile Number" error={errors[2]}>
              <input type="text" name="mobile" value={usr.mobile} onChange={this._onChange.bind(this)} />
            </FormField>
            <FormField>
              <Select options={roles} name="role" value={role} onChange={this._onRoleFilter.bind(this)}/>
            </FormField>
            {buyerAccess}
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Update" primary={true}  onClick={this._updateUser.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    return (
      <div>
		    <AppHeader />
        <Section direction="column" size="xxlarge" pad={{vertical: 'large', horizontal:'small'}}>
          <Box size="large" alignSelf="center" >
            <Table>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Role</th>
                  <th style={{textAlign: 'right'}}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {userItems}
              </tbody>
            </Table>
          </Box>
          <Box size="xsmall" alignSelf="center" pad={{horizontal:'medium'}}>{loading}</Box>
          <Box size="small" alignSelf="center" pad={{vertical:'large'}}>
            <Button icon={<Add />} label="Add User" primary={true} a11yTitle="Add item" onClick={this._onAddClick.bind(this)}/>
          </Box>
        </Section>
        {layerAdd}
        {layerView}
        {layerEdit}
			</div>
    );
  };
}

let select = (store) => {
  return { fit: store.fit, buyer: store.buyer, sku: store.sku};
};

export default connect(select)(User);
