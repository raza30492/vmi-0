import React, {Component} from 'react';
import { connect } from 'react-redux';
import { localeData } from '../reducers/localization';
import { handleErrors, headers } from '../utils/restUtil';
import { getFits } from '../actions';

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
import Section from 'grommet/components/Section';
import Select from 'grommet/components/Select';
import Spinning from 'grommet/components/icons/Spinning';
import Trash from "grommet/components/icons/base/Trash";

import AppHeader from './AppHeader';


class SalesData extends Component {
  constructor () {
	  super();
    this.state = {
      uploading: false,
      isBusy: false,
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

  componentWillMount () {
    this.setState({localeData: localeData()});
    if (!this.props.fit.loaded && sessionStorage.buyerName != 'undefined') {
      this.props.dispatch(getFits(sessionStorage.buyerName));
    }else if (this.props.fit.fits.length == 0) {
      if (sessionStorage.privilege != 'USER') {
        alert("Add Fits and SKUs first.");
        this.context.router.push('/fit');
      }
    }
    //calculating 15 years array
    const curYear = new Date().getFullYear();
    let years = [];
    for (var i = 0; i < 15; i++) {
      years.push((curYear-i).toString());
    }
    this.setState({years: years, showYear: years[0]});
  }

  componentDidMount () {
    if (sessionStorage.buyerName != 'undefined') {
      this._getSalesData(this.state.showYear);
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.fit.loaded && nextProps.fit.loaded && nextProps.fit.fits.length == 0) {
      if (sessionStorage.privilege != 'USER') {
        alert("Add Fits and SKUs first.");
        this.context.router.push('/fit');
      }
    }
  }

  _getSalesData (year) {
    const { buyerName } = this.state;
    const options = { method: 'get', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(window.serviceHost + "/stocks/" + year +"?buyer=" + buyerName, options)
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
    if (year == '') {
      errors[0] = "Year cannot be blank";
      isError = true;
    }
    if (week == '') {
      errors[1] = "Week cannot be blank";
      isError = true;
    }
    if (this.state.files.length == 0) {
      errors[2] = "Choose Excel file containing Sales Data";
      isError = true;
    }
    this.setState({errors: errors});
    if(isError) return;

    //Start Uploading...
    this.setState({isBusy: true, showYear: year});
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

    fetch(window.serviceHost + "/stocks/", options)
    .then((response)=>{
      if (response.status == 200 || response.status == 201) {
        this.setState({uploading:false, isBusy: false});
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
          }else if (code == 40901) {
            this.setState({errorMessage:'Duplicate Entry. Delete the existing file first and then upload again.'});
          }
          this.setState({isBusy: false});
        });
      }
    })
    .catch((error)=>{
      console.log(error);
      this.setState({uploading:false, isBusy: false});
    });
  }

  _delete (url) {
    if (sessionStorage.privilege == 'USER') {
      alert('You do not have privilege for the operation.');
      return;
    }
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
    if (sessionStorage.privilege == 'USER') {
      alert('You do not have privilege for the operation.');
      return;
    }
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
    console.log('onChange()');
    this.setState({showYear: event.value});
    this._getSalesData(event.value);
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
    const {role, buyerName, privilege } = window.sessionStorage;
    let message = (role == 'USER') ? 'You need to select buyer in app header.' : "You need to select buyer in app header since you have 'USER' privilege.";
    if (privilege == 'USER' && buyerName == 'undefined') {
      return (
        <Box>
  		    <AppHeader page={this.state.localeData.label_sales_data} />
          <Section>
            <Box alignSelf="center">
              <h3>{message}</h3>
            </Box>
          </Section>
  			</Box>
      );
    }
    if (sessionStorage.privilege == 'USER' && this.props.fit.loaded && this.props.fit.fits.length == 0) {
      return (
        <Box>
  		    <AppHeader page={this.state.localeData.label_sales_data} />
          <Section>
            <Box alignSelf="center">
              <h3>No Sales data available for selected buyer: {sessionStorage.buyerName}</h3>
            </Box>
          </Section>
  			</Box>
      );
    }

    const { localeData, files, uploading, sales, showYear,years, missingFits, fitFlag, missingSkus, skuFlag, errors, errorMessage, isBusy } = this.state;
    const content = files.length != 0 ? (<div>{files[0].name}</div>) : (<div>Drop file here or Click to open file browser</div>);
    const count = sales.length;
    const busy = isBusy ? <Spinning /> : null;
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
        <Box direction="column" size="medium" >
          <Box>
            <Header><Heading tag="h4" strong={true} >These Fits are Missing, Add them first.</Heading></Header>
          </Box>
          <Box>
            <List>{missingFitItems}</List>
          </Box>
          <Box pad={{vertical: 'medium', horizontal:'small'}} />
        </Box>
      </Layer>
    );

    const layerMissingSkus = (
      <Layer hidden={!skuFlag}  onClose={this._onCloseLayer.bind(this, 'sku')}  closer={true} align="center">
        <Box direction="column" size="large" >
          <Box pad={{vertical: 'small', horizontal:'small'}}>
            <Header><Heading tag="h4" strong={true} >These Skus are Missing, Add them first.</Heading></Header>
          </Box>
          <Box pad={{vertical: 'large', horizontal:'small'}}>
            <List>{missingSkuItems}</List>
          </Box>
        </Box>
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
            <Button icon={busy} label="Upload" primary={true}  onClick={this._upload.bind(this)} />

          </Footer>
        </Form>
      </Layer>
    );

    return (
		  <div>
		    <AppHeader page={localeData.label_sales_data} />
        <Section direction="column" pad={{vertical: 'large', horizontal:'small'}}>
          <Box direction="row" size="small"  alignSelf="center" pad={{vertical:'small'}}>
            <Select   options={years} value={showYear} onChange={this._onChange.bind(this)} />
          </Box>
          <Box size="large" alignSelf="center" >
            <List selectable={true} > {listItems} </List>
            <ListPlaceholder unfilteredTotal={count} filteredTotal={count} emptyMessage={"No Sales Data found for " + showYear} />
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

SalesData.contextTypes = {
  router: React.PropTypes.object.isRequired
};

let select = (store) => {
  return { nav: store.nav, user: store.user, fit: store.fit};
};

export default connect(select)(SalesData);
