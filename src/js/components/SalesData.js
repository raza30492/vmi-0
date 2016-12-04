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
import Section from 'grommet/components/Section';
import Trash from "grommet/components/icons/base/Trash";

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
      sales: []
    };
  }

  componentDidMount () {
    this._getSalesData();
  }

  _getSalesData () {
    const { showYear, buyerName } = this.state;
    console.log(this.state);
    const options = {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Basic ' + window.sessionStorage.token
      }
    };
    fetch(window.serviceHost + "/stock/" + showYear +"?buyer=" + buyerName, options)
    .then(handleErrors)
    .then((response)=>{
      if (response.status == 200) {
        response.json().then((data)=>{
          console.log(data);
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
    var data = new FormData();
    data.append('buyer', buyerName);
    data.append('year', year);
    data.append('week', week);
    data.append("file", this.state.files[0]);
    const options = {
      method: 'post',
      headers: { 'Authorization': 'Basic ' + window.sessionStorage.token },
      body: data
    };

    fetch(window.serviceHost + "/stock/", options)
    .then((response)=>{
      if (response.status == 200 || response.status == 201) {
        this.setState({uploading:false});
        this._getSalesData();
      }
      console.log(response);
    })
    .catch((error)=>{
      console.log(error);
      this.setState({uploading:false});
    });
  }

  _delete (url) {
    console.log(url);
    const options = { method: 'delete', headers: headers };

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
    const options = { method: 'get', headers: headers };

    fetch(url, options)
    .then(function(response) {
      console.log(response);
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
    console.log('onAddClick()');
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
    console.log('onDrop()');
    if (files.length > 1) {
      alert("Select Only 1 File.");
      this.setState({files: []});
      return;
    }
    this.setState({files: files});
  }

  _onCloseLayer (layer) {
    this.setState({uploading: false});
  }

  render () {
    const { files, uploading, sales, showYear } = this.state;
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
    const layerUpload = (
      <Layer hidden={!uploading} onClose={this._onCloseLayer.bind(this)}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Upload Sales Data</Heading></Header>
          <FormFields>
            <FormField label="Year" >
              <input type="text" name="year" value={this.state.year} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week" >
              <input type="text" name="week" value={this.state.week} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Excel File containing Sales Data" >
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
            <Box><input type="text"  value={showYear} onChange={this._onChange.bind(this)} /></Box>
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
			</div>
    );
  }
}

let select = (store) => {
  return { nav: store.nav, user: store.user};
};

export default connect(select)(SalesData);
