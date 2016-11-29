import React, { Component } from "react";
import { connect } from 'react-redux';

import { getBuyers, addBuyer, editBuyer, removeBuyer, TOGGLE_BUYER_ADD_FORM, TOGGLE_BUYER_EDIT_FORM } from '../actions';
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
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Section from 'grommet/components/Section';
import Spinning from 'grommet/components/icons/Spinning';

class Buyer extends Component {

  constructor () {
    super();
    this.state = {
      buyerName: '',
      href: null
    };
  }

  componentDidMount () {
    this.props.dispatch(getBuyers());
  }

  _removeBuyer (href) {
    this.props.dispatch(removeBuyer(href));
  }

  _editBuyer () {
    const { buyerName, href } = this.state;
    if (buyerName == null || buyerName == "") {
      alert("Enetr Buyer Name First!");
      return;
    }
    const buyer = {name: buyerName};
    this.props.dispatch(editBuyer(href,buyer));
    this.setState({href: null, buyerName: ''});
  }

  _onEditClick (name, href) {
    this.setState({href: href, buyerName: name});
    this.props.dispatch({type: TOGGLE_BUYER_EDIT_FORM, payload: {editing: true}});
  }

  _onAddClick () {
    this.props.dispatch({type: TOGGLE_BUYER_ADD_FORM, payload: {adding: true}});
  }

  _onCloseLayer (layer) {
    if( layer == 'add')
      this.props.dispatch({type: TOGGLE_BUYER_ADD_FORM, payload: {adding: false}});
    else
      this.props.dispatch({type: TOGGLE_BUYER_EDIT_FORM, payload: {editing: false}});
    this.setState({href: null, buyerName: ''});
  }

  _onChangeInput (e) {
    this.setState({buyerName:e.target.value});
  }

  _addBuyer () {
    const { buyerName } = this.state;
    if (buyerName == null || buyerName == "") {
      alert("Enetr Buyer Name First!");
      return;
    }
    const buyer = {name: buyerName};
    this.props.dispatch(addBuyer(buyer));
  }

  render () {
    let { buyers, fetching, adding, editing } = this.props.buyer;
    let count = fetching ? 100 : buyers.length;
    const loading = fetching ? (<Spinning />) : null;
    let items = buyers.map(buyer => {
      return (
        <ListItem key={buyer.href} justify="between" pad={{vertical:'none',horizontal:'small'}} >
          <span> {buyer.name} </span>
          <span className="secondary">
            <Button icon={<Edit />} onClick={this._onEditClick.bind(this, buyer.name, buyer.href)}/>
            <Button icon={<Close />} onClick={this._removeBuyer.bind(this, buyer.href)} />
          </span>
        </ListItem>
      );
    });

    const layerAdd = (
      <Layer hidden={!adding} onClose={this._onCloseLayer.bind(this, 'add')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Add New Buyer</Heading></Header>
          <FormFields>
              <FormField label="Buyer name" >
                <input type="text" value={this.state.buyerName} onChange={this._onChangeInput.bind(this)} />
              </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Add" primary={true}  onClick={this._addBuyer.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    const layerEdit = (
      <Layer hidden={!editing} onClose={this._onCloseLayer.bind(this, 'edit')} closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Edit Buyer</Heading></Header>
          <FormFields>
              <FormField label="Buyer name" >
                <input type="text" value={this.state.buyerName} onChange={this._onChangeInput.bind(this)}/>
              </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Edit" primary={true}  onClick={this._editBuyer.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    return (
      <div>
			    <AppHeader />

          <Section direction="column" pad={{vertical: 'large', horizontal:'small'}}>
            <Box size="xsmall" alignSelf="center" pad={{horizontal:'medium'}} >
              {loading}
            </Box>
            <Box size="large" alignSelf="center" >
              <List selectable={true} > {items} </List>
              <ListPlaceholder unfilteredTotal={count} filteredTotal={count} emptyMessage="You do not have any buyers at the moment." />
            </Box>
            <Box size="small" alignSelf="center" pad={{vertical:'large'}}>
              <Button icon={<Add />} label="Add Buyer" primary={true} a11yTitle="Add item" onClick={this._onAddClick.bind(this)}/>
            </Box>
          </Section>

          {layerAdd}
          {layerEdit}
			</div>
    );
  };
}

let select = (store) => {
  return { buyer: store.buyer};
};

export default connect(select)(Buyer);
