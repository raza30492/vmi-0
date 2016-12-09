import React, { Component } from "react";
import { connect } from 'react-redux';

import { getFits, getBuyers } from '../actions';
import { handleErrors, headers } from '../utils/restUtil';

//Components
import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Close from "grommet/components/icons/base/Close";
import Dropzone from 'react-dropzone';
import Edit from "grommet/components/icons/base/Edit";
import Footer from 'grommet/components/Footer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Layer from 'grommet/components/Layer';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Section from 'grommet/components/Section';
import Select from 'grommet/components/Select';
import Spinning from 'grommet/components/icons/Spinning';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

class SKU extends Component {
  constructor () {
    super();
    this.state = {
      fitLoaded: false,
      fetching: false,
      addingSingle: false,
      addingBatch: false,
      editing: false,
      fitName: null,
      skuName: '',
      skus : [],
      files: [],
      errors:[]
    };
    this._onDrop = this._onDrop.bind(this);
    this._getSkus = this._getSkus.bind(this);
  }

  componentWillMount () {
    if (!this.props.buyer.loaded) {
      this.props.dispatch(getBuyers());
    }
    if (!this.props.fit.loaded) {
      this.props.dispatch(getFits());
    }else if (this.props.fit.fits.length != 0) {
      this.setState({fitLoaded: true, fitName: this.props.fit.fits[0].name});
      this._getSkus(this.props.fit.fits[0].name);
    }else{
      alert('Add Fit First!');
      this.setState({fitLoaded: true});
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.fit.loaded) {
      if (!this.state.fitLoaded && nextProps.fit.fits.length != 0) {
        this._getSkus(nextProps.fit.fits[0].name);
        this.setState({fitName: nextProps.fit.fits[0].name});
      }
      this.setState({fitLoaded: true});
    }
  }

  _getSkus (fit) {
    //console.log('getSku()');
    this.setState({fetching: true});
    const options = {method: 'GET', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(window.serviceHost + '/skus/search/findByFitName?fitName=' + fit, options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      let skus = data._embedded.skus.map(sku => {
        return { href: sku._links.self.href, name: sku.name};
      });
      this.setState({skus: skus, fetching:false});
    })
    .catch(error => {
      console.log(error);
      alert('Some Error occured loading data');
      this.setState({fetching: false});
    });
  }

  _addSku () {
    console.log('addSku()');
    const { fitName, skuName} = this.state;
    if (skuName == '') {
      this.setState({errors: ['SKU Name cannot be blank']});
      return;
    }
    const fit = this.props.fit.fits.find(fit=>fit.name==fitName).href;
    const sku = { name: skuName, fit: fit };
    console.log(sku);
    const options = {method: 'POST', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(sku)};
    fetch(window.serviceHost + '/skus', options)
    .then(handleErrors)
    .then((response) => {
      if (response.status == 409) {
        alert('Duplicate Entry!');
      }else{
        response.json().then((data)=>{
          this.setState({addingSingle:false, skuName: ''});
          this._getSkus(fitName);
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  _addBatchSku (e) {
    if (this.state.files.length == 0) {
      this.setState({errors: ['','Choose excel file containing SKU']});
      return;
    }
    const { fitName } = this.state;
    var data = new FormData();
    data.append('fit', fitName);
    data.append("file", this.state.files[0]);
    const options = {
      method: 'post',
      headers: { 'Authorization': 'Basic ' + sessionStorage.token },
      body: data
    };

    fetch(window.serviceHost + "/upload/sku", options)
    .then((response)=>{
      if (response.status == 200 || response.status == 201) {
        this.setState({addingBatch:false});
        this._getSkus(fitName);
      }
      console.log(response);
    })
    .catch((error)=>{
      console.log(error);
      this.setState({addingBatch:false});
    });
  }

  _editSku () {
    //console.log('editSku()');
    const { url, fitName,skuName} = this.state;
    if (skuName == '') {
      this.setState({errors: ['SKU Name cannot be blank']});
      return;
    }
    const fit = this.props.fit.fits.find(fit=>fit.name==fitName).href;
    const sku = { name: skuName, fit: fit};
    const options = {method: 'PUT', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(sku)};
    fetch(url, options)
    .then(handleErrors)
    .then((response) => {
      if (response.status == 409) {
        alert('Duplicate Entry!');
      }else{
        response.json().then((data)=>{
          this.setState({editing:false, url:null, skuName: ''});
          this._getSkus(fitName);
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  _removeSku (url) {
    //console.log('removeSku()');
    const options = {method: 'DELETE', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(url, options)
    .then(handleErrors)
    .then(response => {
      if (response.status == 204 || response.status == 200) {
        this._getSkus(this.state.fitName);
      }
    })
    .catch(error => {
      console.log(error);
    });
  }


  _onFitFilter (e) {
    this.setState({fitName: e.value});
    this._getSkus(e.value);
  }

  _onBuyerFilter (e) {
    this.setState({buyerName: e.value});
  }

  _onChangeInput (e) {
    this.setState({skuName:e.target.value});
  }

  _onAddClick (type) {
    if (type == 'single')
      this.setState({addingSingle: true});
    else if (type == 'batch')
      this.setState({addingBatch: true});
  }

  _onEditClick (url, name) {
    this.setState({url: url, skuName: name, editing: true});
  }

  _onCloseLayer (layer) {
    console.log(layer);
    if( layer == 'addSingle')
      this.setState({addingSingle: false});
    else if (layer == 'addBatch')
      this.setState({addingBatch: false});
    else if (layer == 'edit')
      this.setState({editing: false});

    this.setState({errors: [], files: []});
  }

  _onDrop (files) {
    if (files.length > 1) {
      alert("Select Only 1 File.");
      this.setState({files: []});
      return;
    }
    console.log(files);
    this.setState({files: files});
  }

  render () {
    const { fits } = this.props.fit;
    const { fetching, addingSingle, addingBatch, editing, skus, skuName, files, fitName: value } = this.state;
    const fitItems = fits.map(fit=> fit.name); //Fit Filter all values
    const fitName = (value == null) ? fitItems[0] : value; //Fit Filter selected value
    const count = fetching ? 100 : skus.length;  // For showing emptyMessage [ListPlaceholder]

    const loading = fetching ? (<Spinning />) : null;
    const content = files.length != 0 ? (<div>{files[0].name}</div>) : (<div>Drop file here or Click to open file browser</div>);

    const skuItems = skus.map((sku, index)=>{
      return (
        <TableRow key={index}  >
          <td style={{padding: 0}}>{fitName}</td>
          <td style={{padding: 0}}>{sku.name}</td>
          <td style={{textAlign: 'right', padding: 0}}>
          <Button icon={<Edit />} onClick={this._onEditClick.bind(this,sku.href, sku.name)} />
          <Button icon={<Close />} onClick={this._removeSku.bind(this,sku.href)} />
          </td>
        </TableRow>
      );
    });

    const layerAddSingle = (
      <Layer hidden={!addingSingle} onClose={this._onCloseLayer.bind(this, 'addSingle')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Add New SKU</Heading></Header>
          <FormFields>
            <FormField>
              <Select options={fitItems} value={fitName} onChange={this._onFitFilter.bind(this)}/>
            </FormField>
            <FormField label="SKU name" error={this.state.errors[0]}>
              <input type="text" value={skuName} onChange={this._onChangeInput.bind(this)} />
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Add" primary={true}  onClick={this._addSku.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );
    const style = {
      width: 450,
      height: 100,
      borderWidth: 2,
      borderColor: '#666',
      borderStyle: 'dashed',
      borderRadius: 5,
      textAlign: 'center',
      paddingTop: 35,
      margin: 'auto'
    };
    const layerAddBatch = (
      <Layer hidden={!addingBatch} onClose={this._onCloseLayer.bind(this, 'addBatch')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Upload</Heading></Header>
          <FormFields>
            <FormField>
              <Select options={fitItems} value={fitName} onChange={this._onFitFilter.bind(this)}/>
            </FormField>
            <FormField label="Excel File containing SKU" error={this.state.errors[1]} >
              <Dropzone style={style} onDrop={this._onDrop} accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' >
                {content}
              </Dropzone>
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Upload" primary={true}  onClick={this._addBatchSku.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    const layerEdit = (
      <Layer hidden={!editing} onClose={this._onCloseLayer.bind(this, 'edit')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Edit SKU</Heading></Header>
          <FormFields>
            <FormField>
              <Select options={fitItems} value={fitName} onChange={this._onFitFilter.bind(this)}/>
            </FormField>
            <FormField label="SKU name" error={this.state.errors[0]}>
              <input type="text" value={skuName} onChange={this._onChangeInput.bind(this)} />
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Edit" primary={true}  onClick={this._editSku.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    return (
      <div>
		    <AppHeader />
        <Section direction="column" size="xxlarge" pad={{vertical: 'large', horizontal:'small'}}>
          <Box direction="row" alignSelf="center">
            <Box pad={{horizontal:'small'}}><Button label="Add Single" onClick={this._onAddClick.bind(this, 'single')}  /></Box>
            <Box pad={{horizontal:'small'}}><Button label="Add Batch" onClick={this._onAddClick.bind(this, 'batch')}  /></Box>
          </Box>
          <Box size="large" alignSelf="center" >
            <Table>
              <thead>
                <tr>
                  <th style={{width: 200}}><Select options={fitItems} value={fitName} onChange={this._onFitFilter.bind(this)}/></th>
                  <th>SKU</th>
                  <th style={{textAlign: 'right'}}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {skuItems}
              </tbody>
            </Table>
            <ListPlaceholder unfilteredTotal={count} filteredTotal={count} emptyMessage={"You do not have any SKU for " + fitName + " filter at the moment."} />
          </Box>
          <Box size="xsmall" alignSelf="center" pad={{horizontal:'medium'}}>{loading}</Box>


        </Section>

        {layerAddSingle}
        {layerAddBatch}
        {layerEdit}
			</div>
    );
  };
}

let select = (store) => {
  return { fit: store.fit, buyer: store.buyer, sku: store.sku};
};

export default connect(select)(SKU);
