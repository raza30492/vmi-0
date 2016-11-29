import React, { Component } from "react";
import { connect } from 'react-redux';

import { getBuyers } from '../actions';
import { handleErrors, headers } from '../utils/restUtil';
import { ROLE_USER, ROLE_MERCHANT, ROLE_ADMIN } from '../utils/util';

//Components
import Add from "grommet/components/icons/base/Add";
import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Close from "grommet/components/icons/base/Close";
import Edit from "grommet/components/icons/base/Edit";
import Footer from 'grommet/components/Footer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Layer from 'grommet/components/Layer';
// import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Section from 'grommet/components/Section';
import Select from 'grommet/components/Select';
import Spinning from 'grommet/components/icons/Spinning';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

class User extends Component {
  constructor () {
    super();
    this.state = {
      users: [],
      fetching: false,
      editing: false,
      adding: false,
      user: {},
      url: null,
      roles: [ROLE_USER, ROLE_MERCHANT, ROLE_ADMIN],
      role: ROLE_USER,
      buyer: 'Select buyer access'
    };
    // this._onDrop = this._onDrop.bind(this);
    this._getUsers = this._getUsers.bind(this);
  }

  componentWillMount () {
    if (!this.props.buyer.loaded) {
      this.props.dispatch(getBuyers());
    }
    this._getUsers();
  }

  // componentWillReceiveProps (nextProps) {
  //   if (nextProps.fit.loaded) {
  //     if (!this.state.fitLoaded && nextProps.fit.fits.length != 0) {
  //       this._getSkus(nextProps.fit.fits[0].name);
  //       this.setState({fitName: nextProps.fit.fits[0].name});
  //     }
  //     this.setState({fitLoaded: true});
  //   }
  // }

  _getUsers () {
    console.log('getUsers()');
    this.setState({fetching: true});
    const options = {method: 'GET', headers: {...headers}};
    fetch(window.serviceHost + '/employees', options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      let users = data._embedded.employees.map(user => {
        return { href: user._links.self.href, name: user.name, role: user.role};
      });
      this.setState({users: users, fetching:false});
    })
    .catch(error => {
      console.log(error);
      //alert('Some Error occured loading data');
      this.setState({fetching: false});
    });
  }

  _addUser () {
    //console.log('addSku()');
    const { user, buyer, role } = this.state;
    const data = { ...user, buyer: buyer, role: role};
    console.log(data);
    const options = {method: 'POST', headers: {...headers}, body: JSON.stringify(data)};
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

  // _editSku () {
  //   //console.log('editSku()');
  //   const { url, fitName, buyerName, skuName} = this.state;
  //   if (buyerName.includes('Select Buyer')) {
  //     alert("Select Buyer First");
  //     return;
  //   }
  //   const fit = this.props.fit.fits.find(fit=>fit.name==fitName).href;
  //   const buyer = this.props.buyer.buyers.find(buyer=>buyer.name==buyerName).href;
  //   const sku = { name: skuName, fit: fit, buyer: buyer};
  //   const options = {method: 'PUT', headers: {...headers}, body: JSON.stringify(sku)};
  //   fetch(url, options)
  //   .then(handleErrors)
  //   .then((response) => {
  //     if (response.status == 409) {
  //       alert('Duplicate Entry!');
  //     }else{
  //       response.json().then((data)=>{
  //         this.setState({editing:false, url:null, skuName: ''});
  //         this._getSkus(fitName);
  //       });
  //     }
  //   })
  //   .catch(error => {
  //     console.log(error);
  //   });
  // }

  _removeUser (url) {
    const options = {method: 'DELETE', headers: {...headers}};
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
    this.setState({role: event.value});
  }

  _onChangeInput ( event ) {
    var user = this.state.user;
    user[event.target.getAttribute('name')] = event.target.value;
    this.setState({user: user});
  }

  _onAddClick (type) {
    this.setState({adding: true});
  }

  _onEditClick (user) {
    this.setState({url: user.href, username: user.name, role: user.role, editing: true});
  }

  _onCloseLayer (layer) {
    console.log(layer);
    if( layer == 'add')
      this.setState({adding: false});
    else if (layer == 'edit')
      this.setState({editing: false});
  }

  render () {
    const { buyers } = this.props.buyer;
    const { fetching, adding, editing, users, user, buyer, roles, role } = this.state;
    const loading = fetching ? (<Spinning />) : null;
    const buyerItems = buyers.map(buyer=>buyer.name);
    const userItems = users.map((user, index)=>{
      return (
        <TableRow key={index}  >
          <td >{user.name}</td>
          <td >{user.role}</td>
          <td style={{textAlign: 'right', padding: 0}}>
            <Button icon={<Edit />} onClick={this._onEditClick.bind(this,user)} />
            <Button icon={<Close />} onClick={this._removeUser.bind(this,user.href)} />
          </td>
        </TableRow>
      );
    });

    const layerAdd = (
      <Layer hidden={!adding} onClose={this._onCloseLayer.bind(this, 'add')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Add New User</Heading></Header>
          <FormFields>
            <FormField label="User Name" >
              <input type="text" name="name" value={user.name} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Employee Id" >
              <input type="text" name="id" value={user.id} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Email" >
              <input type="email" name="email" value={user.email} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Mobile Number" >
              <input type="text" name="mobile" value={user.mobile} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField>
              <Select options={roles} value={role} onChange={this._onRoleFilter.bind(this)}/>
            </FormField>
            <FormField>
              <Select options={buyerItems} value={buyer} onChange={this._onBuyerFilter.bind(this)}/>
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Add" primary={true}  onClick={this._addUser.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    // const layerEdit = (
    //   <Layer hidden={!editing} onClose={this._onCloseLayer.bind(this, 'edit')}  closer={true} align="center">
    //     <Form>
    //       <Header><Heading tag="h3" strong={true}>Edit SKU</Heading></Header>
    //       <FormFields>
    //         <FormField>
    //           <Select options={buyerItems} value={buyerName} onChange={this._onBuyerFilter.bind(this)}/>
    //         </FormField>
    //         <FormField>
    //           <Select options={fitItems} value={fitName} onChange={this._onFitFilter.bind(this)}/>
    //         </FormField>
    //         <FormField label="SKU name" >
    //           <input type="text" value={skuName} onChange={this._onChangeInput.bind(this)} />
    //         </FormField>
    //       </FormFields>
    //       <Footer pad={{"vertical": "medium"}} >
    //         <Button label="Edit" primary={true}  onClick={this._editSku.bind(this)} />
    //       </Footer>
    //     </Form>
    //   </Layer>
    // );

    return (
      <div>
		    <AppHeader />
        <Section direction="column" size="xxlarge" pad={{vertical: 'large', horizontal:'small'}}>
          {/*<Box direction="row" alignSelf="center">
            <Box pad={{horizontal:'small'}}><Button label="Add User" onClick={this._onAddClick.bind(this, 'single')}  /></Box>
            <Box pad={{horizontal:'small'}}><Button label="Add Batch" onClick={this._onAddClick.bind(this, 'batch')}  /></Box>
          </Box>*/}
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
			</div>
    );
  };
}

let select = (store) => {
  return { fit: store.fit, buyer: store.buyer, sku: store.sku};
};

export default connect(select)(User);
