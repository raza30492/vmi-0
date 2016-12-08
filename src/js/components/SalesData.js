import React, {Component} from 'react';
import { connect } from 'react-redux';

import { handleErrors, headers } from '../utils/restUtil';

import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import DocumentDownload from "grommet/components/icons/base/DocumentDownload";
import Dropzone from 'react-dropzone';
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
//import Notification from 'grommet/components/Notification';
import Section from 'grommet/components/Section';
import Trash from "grommet/components/icons/base/Trash";
import TextInput from 'grommet/components/TextInput';

import AppHeader from './AppHeader';


class SalesData extends Component {
  constructor () {
	  super();
    this.state = {
      uploading: false,
      showYear: '2016',
      buyerName: sessionStorage.buyerName,
      year: '',
      week: '',
      files: [],
      sales: [],
      missingFits: [],
      fitFlag: false, //whether to show missing fit layer or not
      missingSkus: [],
      skuFlag: false, //whether to show missing sku layer or not
      errors: [],
      errorMessage: ''
    };
  }

  componentDidMount () {
    this._getSalesData();
  }

  _getSalesData () {
    const { showYear, buyerName } = this.state;
    const options = { method: 'get', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(window.serviceHost + "/stock/" + showYear +"?buyer=" + buyerName, options)
    .then(handleErrors)
    .then((response)=>{
      if (response.status == 200) {
        response.json().then((data)=>{
          this.setState({sales: data});
        });
      }
    })
    .catch((error)=>{
      console.log(error);
    });
  }

  _upload (e) {
    const { year, week, buyerName } = this.state;
    let errors = [];
    let isError = false;
    if (year == ''){
      errors[0] = "Year cannot be blank";
      isError = true;
    }
    if (week == ''){
      errors[1] = "Week cannot be blank";
      isError = true;
    }
    if (this.state.files.length == 0){
      errors[2] = "Choose Excel file containing Sales Data";
      isError = true;
    }
    this.setState({errors: errors});
    if(isError) return;

    var data = new FormData();
    data.append('buyer', buyerName);
    data.append('year', year);
    data.append('week', week);
    data.append("file", this.state.files[0]);
    const options = {
      method: 'post',
      headers: { 'Authorization': 'Basic ' + sessionStorage.token },
      body: data
    };

    fetch(window.serviceHost + "/stock/", options)
    .then((response)=>{
      if (response.status == 200 || response.status == 201) {
        this.setState({uploading:false});
        this._getSalesData();
      }else if (response.status == 409) {
        response.json().then((data)=>{
          const { code } = data;
          if (code == 'FITS_MISSING') {
            this.setState({uploading: false, missingFits: data.fitsMissing, fitFlag: true});
          }else if (code == 'SKUS_MISSING') {
            this.setState({uploading: false, missingSkus: data.skusMissing, skuFlag: true});
          }else if (code == 'FILE_ALREADY_EXIST') {
            this.setState({errorMessage:'File Already Exist. Delete existing file first to replace.'});
          }else if (code == 'FILE_NOT_SUPPORTED') {
            let { errors} = this.state;
            errors[2] = 'Only .xls and .xlsx files are supported.';
            this.setState({errors: errors});
          }

        });
      }
    })
    .catch((error)=>{
      console.log(error);
      this.setState({uploading:false});
    });
  }

  _delete (url) {
    const options = { method: 'delete', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};

    fetch(url , options)
    .then(handleErrors)
    .then((response)=>{
      if (response.status == 204 || response.status == 200) {
        console.log('file deleted successfully.');
        this._getSalesData();
      }
    })
    .catch((error)=>{
      console.log(error);
    });
  }

  _download (url, filename) {
    const options = { method: 'get', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};

    fetch(url, options)
    .then(function(response) {
      return response.blob();
    })
    .then(function(myBlob) {
      var downloadUrl = URL.createObjectURL(myBlob);
      var a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
    })
    .catch((error)=>{
      console.log(error);
    });
  }

  _onAddClick () {
    this.setState({uploading: true});
  }

  _onChangeInput (event) {
    if (event.target.getAttribute('name') == 'year') {
      this.setState({year: event.target.value});
    } else if (event.target.getAttribute('name') == 'week') {
      this.setState({week: event.target.value});
    }
  }

  _onChange (event) {
    this.setState({showYear: event.target.value});
  }

  _onDrop (files) {
    if (files.length > 1) {
      alert("Select Only 1 File.");
      this.setState({files: []});
      return;
    }
    this.setState({files: files});
  }

  _onCloseLayer (layer) {
    if (layer == 'upload')
      this.setState({uploading: false,errorMessage: '', errors: []});
    else if (layer == 'fit')
      this.setState({fitFlag: false, missingFits: []});
    else if (layer == 'sku')
      this.setState({skuFlag: false, missingSkus: []});
  }

  render () {
    const { files, uploading, sales, showYear, missingFits, fitFlag, missingSkus, skuFlag, errors, errorMessage } = this.state;
    const content = files.length != 0 ? (<div>{files[0].name}</div>) : (<div>Drop file here or Click to open file browser</div>);
    const count = sales.length;
    let listItems = sales.map((item, i) => {
      return (
        <ListItem key={i} justify="between" pad={{vertical:'none',horizontal:'small'}} >
          <span> {item.filename} </span>
          <span className="secondary">
            <Button icon={<DocumentDownload />} onClick={this._download.bind(this, item.href, item.filename)} />
            <Button icon={<Trash />} onClick={this._delete.bind(this, item.href)} />
          </span>
        </ListItem>
      );
    });

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
    let missingFitItems = missingFits.map((item, i)=>{
      return (<ListItem key={i} >{item}</ListItem>);
    });

    let missingSkuItems = missingSkus.map((item, i)=>{
      return (
        <ListItem key={i} justify="between" pad={{vertical:'small',horizontal:'small'}}>
          <span>{item.sku}</span>
          <span className="secondary">{item.fit}</span>
        </ListItem>
      );
    });

    const layerMissingFits = (
      <Layer hidden={!fitFlag}  onClose={this._onCloseLayer.bind(this, 'fit')}  closer={true} align="center">
        <Box size="medium"  pad={{vertical: 'none', horizontal:'small'}}>
          <Header><Heading tag="h4" strong={true} >These Fits are Missing, Add them first.</Heading></Header>
          <List>
            {missingFitItems}
          </List>
        </Box>
        <Box pad={{vertical: 'medium', horizontal:'small'}}/>
      </Layer>
    );

    const layerMissingSkus = (
      <Layer hidden={!skuFlag}  onClose={this._onCloseLayer.bind(this, 'sku')}  closer={true} align="center">
        <Box size="large"  pad={{vertical: 'none', horizontal:'small'}}>
          <Header><Heading tag="h4" strong={true} >These Skus are Missing, Add them first.</Heading></Header>
          <List>
            {missingSkuItems}
          </List>
        </Box>
        <Box pad={{vertical: 'medium', horizontal:'small'}}/>
      </Layer>
    );

    const layerUpload = (
      <Layer hidden={!uploading} onClose={this._onCloseLayer.bind(this, 'upload')}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Upload Sales Data</Heading></Header>
          <h4 style={{color:'red'}}>{errorMessage}</h4>

          <FormFields>
            <FormField label="Year" error={errors[0]}>
              <input type="text" name="year" value={this.state.year} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week" error={errors[1]}>
              <input type="text" name="week" value={this.state.week} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Excel File containing Sales Data" error={errors[2]} >
              <Dropzone style={style} onDrop={this._onDrop.bind(this)} accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' >
                {content}
              </Dropzone>
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Upload" primary={true}  onClick={this._upload.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    return (
		  <div>
		    <AppHeader />
        <Section direction="column" pad={{vertical: 'large', horizontal:'small'}}>
          <Box direction="row" size="medium" alignSelf="center" pad={{vertical:'small'}}>
            <Box><TextInput  value={showYear} onDOMChange={this._onChange.bind(this)} /></Box>
            <Box><Button label="View Sales Data" onClick={this._getSalesData.bind(this)} /></Box>
          </Box>
          <Box size="large" alignSelf="center" >
            <List selectable={true} > {listItems} </List>
            <ListPlaceholder unfilteredTotal={count} filteredTotal={count} emptyMessage="You do not have any fits at the moment." />
          </Box>

          <Box size="medium" alignSelf="center" pad={{vertical:'large'}}>
            <Button label="Upload Sales Data" primary={true} a11yTitle="Add item" onClick={this._onAddClick.bind(this)}/>
          </Box>
        </Section>
        {layerUpload}
        {layerMissingFits}
        {layerMissingSkus}
			</div>
    );
  }
}

let select = (store) => {
  return { nav: store.nav, user: store.user};
};

export default connect(select)(SalesData);
