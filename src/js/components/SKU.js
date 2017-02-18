import React, { Component } from "react";
import { connect } from 'react-redux';
import { localeData } from '../reducers/localization';
import { getFits } from '../actions';
import { handleErrors, headers } from '../utils/restUtil';

//Components
import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Dropzone from 'react-dropzone';
import Edit from "grommet/components/icons/base/Edit";
import Footer from 'grommet/components/Footer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import Layer from 'grommet/components/Layer';
import ListItem from 'grommet/components/ListItem';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Section from 'grommet/components/Section';
import Select from 'grommet/components/Select';
import Spinning from 'grommet/components/icons/Spinning';
import Trash from "grommet/components/icons/base/Trash";

class SKU extends Component {
  constructor () {
    super();
    this.state = {
      fetching: false,
      isBusy: false,
      addingSingle: false,
      addingBatch: false,
      editing: false,
      fitName: 'Select Fit',
      skuName: '',
      skus : [],
      files: [],
      errors:[]
    };
    this._onDrop = this._onDrop.bind(this);
    this._getSkus = this._getSkus.bind(this);
  }

  componentWillMount () {
    this.setState({localeData: localeData()});
    if (!this.props.fit.loaded) {
      this.props.dispatch(getFits(sessionStorage.buyerName));
    }else if (this.props.fit.fits.length == 0) {
      if (sessionStorage.privilege != 'USER') {
        alert("Add Fits first.");
        this.context.router.push('/fit');
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.fit.loaded && nextProps.fit.loaded && nextProps.fit.fits.length == 0) {
      if (sessionStorage.privilege != 'USER') {
        alert("Add Fits first.");
        this.context.router.push('/fit');
      }
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
        return {name: sku.name, href: sku._links.self.href};
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
        response.json().then((resp)=>{
          alert(resp.message);
        });
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
    const { fitName } = this.state;
    if (fitName == 'Select Fit') {
      this.setState({errors: ['Fit not selected.','']});
      return;
    }
    if (this.state.files.length == 0 || this.state.files.length > 1 ) {
      this.setState({errors: ['','Choose one excel file containing SKU']});
      return;
    }
    this.setState({isBusy: true});

    var data = new FormData();
    data.append('fit', fitName);
    data.append("file", this.state.files[0]);
    const options = {
      method: 'post',
      headers: { 'Authorization': 'Basic ' + sessionStorage.token },
      body: data
    };

    fetch(window.serviceHost + "/skus/upload", options)
    .then((response)=>{
      if (response.status == 200 || response.status == 201) {
        this.setState({addingBatch:false, isBusy: false});
        this._getSkus(fitName);
      }
    })
    .catch((error)=>{
      console.log(error);
      this.setState({addingBatch:false, isBusy: false});
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
        response.json().then((resp)=>{
          this.setState({editing:false, url:null, skuName: ''});
          alert(resp.message);
        });
      }else{
        response.json().then((data)=>{
          this.setState({editing:false, url:null, skuName: ''});
          this._getSkus(fitName);
        });
      }
    })
    .catch(error => {
      this.setState({editing:false, url:null, skuName: ''});
      console.log(error);
    });
  }

  _removeSku (url) {
    if (sessionStorage.privilege == 'USER') {
      alert('You do not have privilege for the operation.');
      return;
    }
    let value = confirm('Are you sure to delete this SKU?');
    if (value) {
      const options = {method: 'DELETE', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
      fetch(url, options)
      .then(handleErrors)
      .then(response => {
        if (response.status == 204 || response.status == 200) {
          this._getSkus(this.state.fitName);
        }else if (response.status == 409) {
          response.json().then((resp)=>{
            alert(resp.message);
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
    }
  }

  _deleteBatch () {
    if (sessionStorage.privilege == 'USER') {
      alert('You do not have privilege for the operation.');
      return;
    }
    if (this.state.fitName == 'Select Fit') {
      alert('Select Fit to delete');
      return;
    }
    let value = confirm('Are you sure to delete this all SKU for ' + this.state.fitName + ' ?');
    if (value) {
      const options = {method: 'DELETE', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
      fetch(window.serviceHost + "/skus/byFit?fitName=" + this.state.fitName, options)
      .then(handleErrors)
      .then(response => {
        if (response.status == 204 || response.status == 200) {
          this._getSkus(this.state.fitName);
        }else if (response.status == 409) {
          response.json().then((resp)=>{
            alert(resp.message);
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
    }
  }

  _onFitFilter (e) {
    this.setState({fitName: e.value});
    this._getSkus(e.value);
  }

  // _onBuyerFilter (e) {
  //   this.setState({buyerName: e.value});
  // }

  _onChangeInput (e) {
    this.setState({skuName:e.target.value});
  }

  _onAddClick (type) {
    console.log('_onAddClick(): ' + type);
    if (sessionStorage.privilege == 'USER') {
      alert('You do not have privilege for the operation.');
      return;
    }
    if (type == 'single')
      this.setState({addingSingle: true});
    else if (type == 'batch')
      this.setState({addingBatch: true});
  }

  _onEditClick (url, name) {
    if (sessionStorage.privilege == 'USER') {
      alert('You do not have privilege for the operation.');
      return;
    }
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
    const { localeData, fetching, addingSingle, addingBatch, editing, skus, skuName, files, isBusy, fitName: value} = this.state;
    const {role, buyerName, privilege } = window.sessionStorage;

    let message = (role == 'USER') ? 'You need to select buyer in app header.' : "You need to select buyer in app header since you have 'USER' privilege.";

    if (privilege == 'USER' && buyerName == 'undefined') {
      return (
        <Box>
  		    <AppHeader page={localeData.label_sku} />
          <Section>
            <Box alignSelf="center">
              <h3>{message}</h3>
            </Box>
          </Section>
  			</Box>
      );
    }

    if (privilege == 'USER' && this.props.fit.loaded && this.props.fit.fits.length == 0) {
      return (
        <Box>
  		    <AppHeader page={localeData.label_sku} />
          <Section>
            <Box alignSelf="center">
              <h3>No SKU data available for selected buyer: {sessionStorage.buyerName}</h3>
            </Box>
          </Section>
  			</Box>
      );
    }


    const { fits } = this.props.fit;
    const fitItems = fits.map(fit=> fit.name); //Fit Filter all values
    const fitName = (value == null) ? fitItems[0] : value; //Fit Filter selected value
    const count = fetching ? 100 : skus.length;  // For showing emptyMessage [ListPlaceholder]
    const loading = fetching ? (<Spinning />) : null;
    const busy = isBusy ? (<Spinning />) : null;
    const content = files.length != 0 ? (<div>{files[0].name}</div>) : (<div>Drop file here or Click to open file browser</div>);

    let skuItems = [];
    if (skus.length > 0) {
      let i;
      for(i = 0; i <= (skus.length/3); i++) {
        skuItems.push(
          <Box direction="row" key={i}>
            <Box size="medium">
              <ListItem justify="between" pad={{vertical:'none',horizontal:'small'}} >
                <span> {(3*i) < skus.length ? skus[3*i].name : null} </span>
                {(3*i) < skus.length ?
                  <span className="secondary">
                  <Button icon={<Edit />} onClick={this._onEditClick.bind(this, skus[3*i].href, skus[3*i].name)} />
                  <Button icon={<Trash />} onClick={this._removeSku.bind(this, skus[3*i].href)} />
                  </span> : null
                }
              </ListItem>
            </Box>
            <Box size="medium">
              <ListItem justify="between" pad={{vertical:'none',horizontal:'small'}} >
                <span> {(3*i+1) < skus.length ? skus[3*i+1].name : null} </span>
                {(3*i+1) < skus.length ?
                  <span className="secondary">
                    <Button icon={<Edit />} onClick={this._onEditClick.bind(this, skus[3*i+1].href, skus[3*i+1].name)} />
                    <Button icon={<Trash />} onClick={this._removeSku.bind(this, skus[3*i+1].href)} />
                  </span> : null
                }
              </ListItem>
            </Box>
            <Box size="medium">
              <ListItem justify="between" pad={{vertical:'none',horizontal:'small'}} >
                <span> {(3*i+2) < skus.length ? skus[3*i+2].name : null} </span>
                {(3*i+2) < skus.length ?
                  <span className="secondary">
                    <Button icon={<Edit />} onClick={this._onEditClick.bind(this, skus[3*i+2].href, skus[3*i+2].name)} />
                    <Button icon={<Trash />} onClick={this._removeSku.bind(this, skus[3*i+2].href)} />
                  </span> : null
                }
              </ListItem>
            </Box>
          </Box>
        );
      }
    }

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
            <FormField error={this.state.errors[0]}>
              <Select options={fitItems} value={fitName} onChange={this._onFitFilter.bind(this)}/>
            </FormField>
            <FormField label="Excel File containing SKU" error={this.state.errors[1]} >
              <Dropzone style={style} onDrop={this._onDrop} accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' >
                {content}
              </Dropzone>
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button icon={busy} label="Upload" primary={true}  onClick={this._addBatchSku.bind(this)} />
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
		    <AppHeader page={localeData.label_sku}/>
        <Section direction="column" size="xxlarge" pad={{vertical: 'large', horizontal:'small'}}>
          <Box direction="row">
            <Box basis="1/3" align="start">
              <Button primary={true} label="Add Single" onClick={this._onAddClick.bind(this, 'single')}  />
            </Box>
            <Box basis="1/3" align="center">
              <Select options={fitItems} value={fitName} onChange={this._onFitFilter.bind(this)}/>
            </Box>
            <Box basis="1/3" align="end">
              <Button primary={true} label="Add Batch" onClick={this._onAddClick.bind(this, 'batch')}  />
            </Box>
          </Box>

          <Box size="xsmall" alignSelf="center" pad={{horizontal:'medium', vertical:'medium'}}>{loading}</Box>
          <Box alignSelf="center" pad={{horizontal:'medium', vertical:'none'}}>
            <Button primary={true} label="Delete All" onClick={this._deleteBatch.bind(this)}  />
          </Box>
          <Box direction="column" alignSelf="center" pad={{vertical: 'large'}}>
            {skuItems}
            <ListPlaceholder unfilteredTotal={count} filteredTotal={count} emptyMessage={'No Skus found for ' + fitName} />
          </Box>
        </Section>

        {layerAddSingle}
        {layerAddBatch}
        {layerEdit}
			</div>
    );
  };
}

SKU.contextTypes = {
  router: React.PropTypes.object.isRequired
};

let select = (store) => {
  return { fit: store.fit, sku: store.sku, user: store.user};
};

export default connect(select)(SKU);
