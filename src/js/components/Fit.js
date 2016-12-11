import React, { Component } from "react";
import { connect } from 'react-redux';

import { getFits, addFit, editFit, removeFit, TOGGLE_FIT_ADD_FORM, TOGGLE_FIT_EDIT_FORM } from '../actions';
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

class Fit extends Component {

  constructor () {
    super();
    this.state = {
      buyerHref: window.sessionStorage.buyerHref,
      fitName: '',
      href: null,
      errors: []
    };
  }

  componentDidMount () {
    this.props.dispatch(getFits());
  }

  _addFit () {
    const { fitName, buyerHref: buyer } = this.state;
    if (fitName == null || fitName == "") {
      this.setState({errors: ['Fit Name cannot be blank']});
      return;
    }
    const fit = {name: fitName, buyer: buyer};
    this.props.dispatch(addFit(fit));
    this.setState({fitName:''});
  }

  _removeFit (href) {
    this.props.dispatch(removeFit(href));
  }

  _editFit () {
    const { fitName, href } = this.state;
    if (fitName == null || fitName == "") {
      this.setState({errors: ['Fit Name cannot be blank']});
      return;
    }
    const fit = {name: fitName};
    this.props.dispatch(editFit(href,fit));
    this.setState({href: null, fitName: ''});
  }

  _onEditClick (name, href) {
    this.setState({href: href, fitName: name});
    this.props.dispatch({type: TOGGLE_FIT_EDIT_FORM, payload: {editing: true}});
  }

  _onAddClick () {
    this.props.dispatch({type: TOGGLE_FIT_ADD_FORM, payload: {adding: true}});
  }

  _onCloseLayer (layer) {
    if( layer == 'add')
      this.props.dispatch({type: TOGGLE_FIT_ADD_FORM, payload: {adding: false}});
    else
      this.props.dispatch({type: TOGGLE_FIT_EDIT_FORM, payload: {editing: false}});
    this.setState({href: null, fitName: '', errors: []});
  }

  _onChangeInput (e) {
    this.setState({fitName:e.target.value});
  }



  render () {
    //this.props.dispatch(getFits());
    let { fits, fetching, adding, editing } = this.props.fit;
    let count = fetching ? 100 : fits.length;
    let items = fits.map(fit => {
      return (
        <ListItem key={fit.href} justify="between" pad={{vertical:'none',horizontal:'small'}} >
          <span> {fit.name} </span>
          <span className="secondary">
            <Button icon={<Edit />} onClick={this._onEditClick.bind(this, fit.name, fit.href)}/>
            <Button icon={<Close />} onClick={this._removeFit.bind(this, fit.href)} />
          </span>
        </ListItem>
      );
    });
    const loading = fetching ? (<Spinning />) : null;

    const layerAdd = (
      <Layer hidden={!adding} onClose={this._onCloseLayer.bind(this, 'add')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Add New Fit</Heading></Header>
          <FormFields>
              <FormField label="Fit name" error={this.state.errors[0]} >
                <input type="text" value={this.state.fitName} onChange={this._onChangeInput.bind(this)} />
              </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Add" primary={true}  onClick={this._addFit.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    const layerEdit = (
      <Layer hidden={!editing} onClose={this._onCloseLayer.bind(this, 'edit')} closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Edit Fit</Heading></Header>
          <FormFields>
              <FormField label="Fit name" error={this.state.errors[0]}>
                <input type="text" value={this.state.fitName} onChange={this._onChangeInput.bind(this)}/>
              </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Edit" primary={true}  onClick={this._editFit.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    return (
      <div>
			    <AppHeader page="Fit" />

          <Section direction="column" pad={{vertical: 'large', horizontal:'small'}}>
            <Box size="xsmall" alignSelf="center" pad={{horizontal:'medium'}} >
              {loading}
            </Box>
            <Box size="large" alignSelf="center" >
              <List selectable={true} > {items} </List>
              <ListPlaceholder unfilteredTotal={count} filteredTotal={count} emptyMessage="You do not have any fits at the moment." />
            </Box>
            <Box size="small" alignSelf="center" pad={{vertical:'large'}}>
              <Button icon={<Add />} label="Add Fit" primary={true} a11yTitle="Add item" onClick={this._onAddClick.bind(this)}/>
            </Box>
          </Section>

          {layerAdd}
          {layerEdit}
			</div>
    );
  };
}

let select = (store) => {
  return { fit: store.fit};
};

export default connect(select)(Fit);
