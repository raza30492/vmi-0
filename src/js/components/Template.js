import React, {Component} from 'react';
import { handleErrors, headers } from '../utils/restUtil';

import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import DocumentDownload from "grommet/components/icons/base/DocumentDownload";
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Section from 'grommet/components/Section';

export default class Template extends Component {
  constructor () {
	  super();
    this.state = {
      templates: []
    };
  }

  componentDidMount () {
    console.log('componentDidMount');
    this._getTemplates();
  }

  _getTemplates () {
    //const { showYear, buyerName } = this.state;
    const options = { method: 'get', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    fetch(window.serviceHost + "/templates", options)
    .then(handleErrors)
    .then((response)=>{
      if (response.status == 200) {
        response.json().then((data)=>{
          this.setState({templates: data});
        });
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

  render () {
    const { templates } = this.state;
    const links = templates.map((item, i)=>{
      return (
        <ListItem key={i} justify="between" pad={{vertical:'none',horizontal:'small'}} >
          <span> {item.filename} </span>
          <span className="secondary">
            <Button icon={<DocumentDownload />} onClick={this._download.bind(this, item.href, item.filename)} />
          </span>
        </ListItem>
      );
    });
    return (
		  <Box>
		    <AppHeader page="Template" />
        <Section>
          <Box size="large" alignSelf="center">
            Any data is uploaded using excel file containing data. Therefore it is necessanry to define fixed excel template
            for uploading data.  These template for Sales data and SKU data upload can be downloaded from following links.
            Download the template, copy and paste the necessary data in it and then upload.
          </Box>
          <Box size="medium" alignSelf="center" pad={{vertical: 'large'}}>
            <List>{links}</List>
          </Box>
        </Section>

			</Box>
    );
  }
}
