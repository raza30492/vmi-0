import React, {Component} from 'react';
import { connect } from 'react-redux';

import { getFits } from '../actions';
import { handleErrors, headers } from '../utils/restUtil';

import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import DocumentDownload from "grommet/components/icons/base/DocumentDownload";
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
// import Spinning from 'grommet/components/icons/Spinning';
import Tab from 'grommet/components/Tab';
import Tabs from 'grommet/components/Tabs';
// import Table from 'grommet/components/Table';
// import TableRow from 'grommet/components/TableRow';
import Trash from "grommet/components/icons/base/Trash";


class Proposal extends Component {
  constructor () {
	  super();
    this.state = {
      fetching: false,  //fetching proposals
      calculating: false,
      fitLoaded: false,
      fitName: '',
      mainProposals: [],
      summaryProposals: [],
      year: '2016',
      data: {} //request data for Calculate rest call
    };
  }

  componentWillMount () {
    if (!this.props.fit.loaded) {
      this.props.dispatch(getFits());
    }else if (this.props.fit.fits.length != 0) {
      this.setState({fitLoaded: true, fitName: this.props.fit.fits[0].name});
      this._getProposals(this.props.fit.fits[0].name);
    }else{
      alert('Add Fit First!');
      this.setState({fitLoaded: true});
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.fit.loaded) {
      if (!this.state.fitLoaded && nextProps.fit.fits.length != 0) {
        this._getProposals(nextProps.fit.fits[0].name);
        this.setState({fitName: nextProps.fit.fits[0].name});
      }
      this.setState({fitLoaded: true});
    }
  }

  _getProposals (fitName) {
    const options = {method: 'GET', headers: {...headers}};
    //fetch main Proposals
    let url = window.serviceHost + '/proposals/main/' + this.state.year + '?fitName=' + fitName;
    console.log(url);
    fetch(url, options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      this.setState({mainProposals: data});
    })
    .catch(error => {
      console.log(error);
      alert('Some Error occured loading data');
    });
    //Fetch Summary Proposals
    url = window.serviceHost + '/proposals/summary/' + this.state.year + '?fitName=' + fitName;
    console.log(url);
    fetch(url, options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      this.setState({summaryProposals: data});
    })
    .catch(error => {
      console.log(error);
      alert('Some Error occured loading data');
    });
  }

  _calculateProposal () {
    const { data, fitName } = this.state;
    console.log(data);
    const options = {method: 'post', headers: headers, body: JSON.stringify(data)};
    fetch(window.serviceHost + '/proposals/', options)
    .then(handleErrors)
    .then((response)=>{
      if ( response.status == 201 || response.status == 200) {
        this._getProposals(fitName);
        this.setState({calculating: false});
      }
    })
    .catch((error)=>{
      console.log(error);
      this.setState({calculating: false});
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

  _delete (url) {

  }


  _viewHistory () {
    this._getProposals(this.state.fitName);
  }

  _onFitFilter (e) {
    this.setState({fitName: e.value});
  }

  _onChange (e) {
    this.setState({year: e.target.value});
  }

  _onChangeInput ( event ) {
    var data = this.state.data;
    if (event.target.getAttribute('name') == 'fitName')
      data[event.target.getAttribute('name')] = event.value;
    else
      data[event.target.getAttribute('name')] = event.target.value;
    this.setState({data: data});
  }

  _onCalculateClick () {
    this.setState({calculating: true});
  }

  _onCloseLayer (layer) {
    this.setState({calculating: false});
  }

  render () {
    const { fits } = this.props.fit;
    const { fitName, year, mainProposals, summaryProposals, calculating, data } = this.state;

    const fitItems = fits.map(fit=> fit.name); //Fit Filter all values
    const mainCount = mainProposals.length;
    const summaryCount = summaryProposals.length;
    let mainItems = mainProposals.map((item, i) => {
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

    let summaryItems = summaryProposals.map((item, i) => {
      return (
        <ListItem key={i} justify="between" pad={{vertical:'none',horizontal:'small'}} >
          <span> {item.filename} </span>
          <span className="secondary">
            <Button icon={<DocumentDownload />} onClick={this._download.bind(this, 'summary', item.href, item.filename)} />
            <Button icon={<Trash />} onClick={this._delete.bind(this, 'summary', item.href)} />
          </span>
        </ListItem>
      );
    });

    const layerCalculate = (
      <Layer hidden={!calculating} onClose={this._onCloseLayer.bind(this)}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Calculate VMI Proposal</Heading></Header>
          <FormFields>
            <FormField>
              <Select options={fitItems} name="fitName" value={data.fitName} onChange={this._onChangeInput.bind(this)}/>
            </FormField>
            <FormField label="Year" >
              <input type="text" name="year" value={data.year} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week" >
              <input type="text" name="week" value={data.week} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Sale Forcast for proposed Week" >
              <input type="text" name="salesForcast" value={data.salesForcast} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Cummulative Forcast upto proposed Week" >
              <input type="text" name="cumSalesForcast" value={data.cumSalesForcast} onChange={this._onChangeInput.bind(this)} />
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button label="Calculate Proposal" primary={true}  onClick={this._calculateProposal.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    return (
		  <div>
		    <AppHeader />
        <Section direction="column" pad={{vertical: 'large', horizontal:'small'}}>
          <Box direction="row" size="xxlarge" alignSelf="center" pad={{vertical:'small'}}>
            <Box><Select options={fitItems} value={fitName} onChange={this._onFitFilter.bind(this)}/></Box>
            <Box><input type="text"  value={year} onChange={this._onChange.bind(this)} /></Box>
            <Box><Button label="View Proposal History" onClick={this._viewHistory.bind(this)} /></Box>
          </Box>
          <Box size="large" alignSelf="center" >
            <Tabs justify="center">
              <Tab title="Proposal">
                <Box>
                  <List selectable={true} > {mainItems} </List>
                  <ListPlaceholder unfilteredTotal={mainCount} filteredTotal={mainCount} emptyMessage="You do not have any fits at the moment." />
                </Box>
              </Tab>
              <Tab title="Proposal Summary">
                <Box>
                  <List selectable={true} > {summaryItems} </List>
                  <ListPlaceholder unfilteredTotal={summaryCount} filteredTotal={summaryCount} emptyMessage="You do not have any fits at the moment." />
                </Box>
              </Tab>
            </Tabs>
          </Box>
          <Box size="medium" alignSelf="center" pad={{vertical:'large'}}>
            <Button label="Calculate Proposal" primary={true} onClick={this._onCalculateClick.bind(this)}/>
          </Box>
        </Section>
        {layerCalculate}
			</div>
    );
  }
}

let select = (store) => {
  return { fit: store.fit, user: store.user};
};

export default connect(select)(Proposal);
