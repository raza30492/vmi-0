import React, {Component} from 'react';
import { connect } from 'react-redux';
import { getFits } from '../actions';
import { handleErrors, headers } from '../utils/restUtil';
import { localeData } from '../reducers/localization';
//Components
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
import Notification from 'grommet/components/Notification';
import Section from 'grommet/components/Section';
import Select from 'grommet/components/Select';
import Spinning from 'grommet/components/icons/Spinning';
import Tab from 'grommet/components/Tab';
import Tabs from 'grommet/components/Tabs';

class Proposal extends Component {
  constructor () {
	  super();
    const today = new Date();
    this.state = {
      isClose: true,  // Whether Notification is closed
      isBusy: false,
      status: '', //Notification status [ok, critical, warning]
      message: '',  //Notification message
      fetching: false,  //fetching proposals
      calculating: false,
      fitName: '',
      mainProposals: [],
      summaryProposals: [],
      year: today.getFullYear().toString(),
      data: {}, //request data for Calculate rest call
      skuFlag: false, // Show missing Sku Layer
      missingSkus: [],
      errors: []
    };
  }

  componentWillMount () {
    // const today = new Date();
    // this.setState({year: today.getFullYear().toString()});

    this.setState({localeData: localeData()});
    if (!this.props.fit.loaded && sessionStorage.buyerName != 'undefined') {
      this.props.dispatch(getFits(sessionStorage.buyerName));
    }else if (this.props.fit.fits.length != 0) {
      this.setState({fitName: this.props.fit.fits[0].name});
      this._getProposals(this.props.fit.fits[0].name);
    }else{
      if (sessionStorage.privilege != 'USER') {
        alert('Add Fits, SKUs and upload sales data first!');
        this.context.router.push('/fit');
      }
    }

  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.fit.loaded && nextProps.fit.loaded && nextProps.fit.fits.length == 0) {
      if (sessionStorage.privilege != 'USER') {
        alert('Add Fits, SKUs and upload sales data first!');
        this.context.router.push('/fit');
      }
    }else if (nextProps.fit.loaded && nextProps.fit.fits.length != 0) {
      this.setState({fitName: nextProps.fit.fits[0].name});
      this._getProposals(nextProps.fit.fits[0].name);
    }
  }

  _getProposals (fitName) {
    const options = {method: 'GET', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    //fetch main Proposals
    let url = window.serviceHost + '/proposals/main/' + this.state.year + '?fitName=' + fitName;
    fetch(url, options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      this.setState({mainProposals: data});
    })
    .catch(error => {
      console.log(error);
      alert('Some Error occured loading data');
    });
    //Fetch Summary Proposals
    url = window.serviceHost + '/proposals/summary/' + this.state.year + '?fitName=' + fitName;
    fetch(url, options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      this.setState({summaryProposals: data});
    })
    .catch(error => {
      console.log(error);
      alert('Some Error occured loading data');
    });
  }

  _calculateProposal () {
    const { data, fitName } = this.state;
    let errors = [];
    let isError = false;
    if (data.year == '' || data.year == undefined) {
      errors[0] = "Year cannot be blank";
      isError = true;
    }
    if (data.week1 == '' || data.week1 == undefined) {
      errors[1] = "Week1 value cannot be blank";
      isError = true;
    }
    if (data.salesForcast == '' || data.salesForcast == undefined) {
      errors[2] = "Sales Forcast cannot be blank";
      isError = true;
    }
    if (data.cumSalesForcast == '' || data.cumSalesForcast == undefined) {
      errors[3] = "Cummulative Sales Forcast cannot be blank";
      isError = true;
    }

    this.setState({errors: errors});
    if(isError) return;

    //Calculate proposals
    this.setState({isBusy: true});
    const options = {method: 'post', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}, body: JSON.stringify(data)};
    fetch(window.serviceHost + '/proposals/calculate', options)
    .then(handleErrors)
    .then((response)=>{
      if ( response.status == 201 || response.status == 200) {
        this._getProposals(fitName);
        this.setState({calculating: false, isBusy: false});
      }else if (response.status == 409) {
        response.json().then((resp)=>{
          if (resp.code == "CURRENT_YEAR_WEEK1_DATA_NOT_FOUND") {
            this.setState({calculating: false, isClose: false, status: 'critical', message: 'Current year Week1 Sales Data is not uploaded.'});
          } else if (resp.code == "CURRENT_YEAR_WEEK2_DATA_NOT_FOUND") {
            this.setState({calculating: false, isClose: false, status: 'critical', message: 'Current year Week2 Sales Data is not uploaded.'});
          } else if (resp.code == "CURRENT_YEAR_WEEK3_DATA_NOT_FOUND") {
            this.setState({calculating: false, isClose: false, status: 'critical', message: 'Current year Week3 Sales Data is not uploaded.'});
          } else if (resp.code == "CURRENT_YEAR_WEEK4_DATA_NOT_FOUND") {
            this.setState({calculating: false, isClose: false, status: 'critical', message: 'Current year Week4 Sales Data is not uploaded.'});
          } else if (resp.code == "PREVIOUS_YEAR_DATA_NOT_FOUND") {
            this.setState({calculating: false, isClose: false, status: 'critical', message: 'Previous year Sales Data is not uploaded.'});
          } else if (resp.code == "HISTORY_SKUS_MISSING") {
            this.setState({calculating: false, skuFlag: true, missingSkus: resp.skusMissing});
          }
          this.setState({isBusy: false});
        });
      }
    })
    .catch((error)=>{
      console.log(error);
      this.setState({calculating: false, isBusy: false});
    });
  }

  _download (url, filename) {
    const options = { method: 'get', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token} };

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
    if (sessionStorage.privilege == 'USER') {
      alert('You do not have privilege for the operation.');
      return;
    }
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
    if (event.target.getAttribute('name') == 'fitName') {
      data[event.target.getAttribute('name')] = event.value;
      this.setState({fitName: event.value});
    } else
      data[event.target.getAttribute('name')] = event.target.value;
    this.setState({data: data});
  }

  _onCalculateClick () {
    if (sessionStorage.privilege == 'USER') {
      alert('You do not have privilege for the operation.');
      return;
    }
    let { data, fitName } = this.state;
    data.fitName = fitName;
    this.setState({calculating: true, data: data});
  }

  _onCloseLayer (layer) {
    this.setState({calculating: false});
    this._getProposals(this.state.fitName);
  }

  _onClose () {
    this.setState({isClose: true, message: null, status: null});
  }

  render () {
    const {role, buyerName, privilege } = window.sessionStorage;
    let msg = (role == 'USER') ? 'You need to select buyer in app header.' : "You need to select buyer in app header since you have 'USER' privilege.";
    if (privilege == 'USER' && buyerName == 'undefined') {
      return (
        <Box>
  		    <AppHeader page={this.state.localeData.label_proposal} />
          <Section>
            <Box alignSelf="center">
              <h3>{msg}</h3>
            </Box>
          </Section>
  			</Box>
      );
    }
    if (sessionStorage.privilege == 'USER' && this.props.fit.loaded && this.props.fit.fits.length == 0) {
      return (
        <Box>
  		    <AppHeader page={this.state.localeData.label_proposal} />
          <Section>
            <Box alignSelf="center">
              <h3>No Proposal data available for selected buyer: {sessionStorage.buyerName}</h3>
            </Box>
          </Section>
  			</Box>
      );
    }
    const { fits } = this.props.fit;
    const { localeData, fitName, year, mainProposals, summaryProposals, calculating, data, isClose, status, message, skuFlag, missingSkus, errors, isBusy } = this.state;

    const notification = isClose ? null : (<Notification full={false} closer={true} message={message} status={status} size="medium" onClose={this._onClose.bind(this)} /> );
    const busy = isBusy ? <Spinning /> : null;
    const fitItems = fits.map(fit=> fit.name); //Fit Filter all values
    const mainCount = mainProposals.length;
    const summaryCount = summaryProposals.length;
    let mainItems = mainProposals.map((item, i) => {
      return (
        <ListItem key={i} justify="between" pad={{vertical:'none',horizontal:'small'}} >
          <span> {item.filename} </span>
          <span className="secondary">
            <Button icon={<DocumentDownload />} onClick={this._download.bind(this, item.href, item.filename)} />
          </span>
        </ListItem>
      );
    });

    let summaryItems = summaryProposals.map((item, i) => {
      return (
        <ListItem key={i} justify="between" pad={{vertical:'none',horizontal:'small'}} >
          <span> {item.filename} </span>
          <span className="secondary">
            <Button icon={<DocumentDownload />} onClick={this._download.bind(this, item.href, item.filename)} />
          </span>
        </ListItem>
      );
    });

    let missingSkuItems = missingSkus.map((item, i)=>{
      return (
        <ListItem key={i} justify="between" pad={{vertical:'small',horizontal:'small'}}>
          <span>{item.sku}</span>
          <span className="secondary">{item.fit}</span>
        </ListItem>
      );
    });

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

    const layerCalculate = (
      <Layer hidden={!calculating} onClose={this._onCloseLayer.bind(this)}  closer={true} align="center">
        <Form>
          <Header><Heading tag="h3" strong={true}>Calculate VMI Proposal</Heading></Header>
          <FormFields>
            <FormField >
              <Select options={fitItems} name="fitName" value={data.fitName} onChange={this._onChangeInput.bind(this)}/>
            </FormField>
            <FormField label="Year*" error={errors[0]}>
              <input type="text" name="year" value={data.year} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week1*" error={errors[1]}>
              <input type="text" name="week1" value={data.week1} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week2" >
              <input type="text" name="week2" value={data.week2} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week3">
              <input type="text" name="week3" value={data.week3} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week4" >
              <input type="text" name="week4" value={data.week4} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Sale Forcast for proposed Week" error={errors[2]}>
              <input type="text" name="salesForcast" value={data.salesForcast} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Cummulative Forcast upto proposed Week" error={errors[3]}>
              <input type="text" name="cumSalesForcast" value={data.cumSalesForcast} onChange={this._onChangeInput.bind(this)} />
            </FormField>
          </FormFields>
          <Footer pad={{"vertical": "medium"}} >
            <Button icon={busy} label="Calculate Proposal" primary={true}  onClick={this._calculateProposal.bind(this)} />
          </Footer>
        </Form>
      </Layer>
    );

    return (
		  <div>
		    <AppHeader page={localeData.label_proposal} />
        <Section direction="column" pad={{vertical: 'large', horizontal:'small'}}>
          <Box>{notification}</Box>
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
                  <ListPlaceholder unfilteredTotal={mainCount} filteredTotal={mainCount} emptyMessage={"No history proposals found for " + fitName + " in " + year} />
                </Box>
              </Tab>
              <Tab title="Proposal Summary">
                <Box>
                  <List selectable={true} > {summaryItems} </List>
                  <ListPlaceholder unfilteredTotal={summaryCount} filteredTotal={summaryCount} emptyMessage={"No history proposals found for " + fitName + " in " + year} />
                </Box>
              </Tab>
            </Tabs>
          </Box>
          <Box size="medium" alignSelf="center" pad={{vertical:'large'}}>
            <Button label="Calculate Proposal" primary={true} onClick={this._onCalculateClick.bind(this)}/>
          </Box>
        </Section>
        {layerCalculate}
        {layerMissingSkus}
			</div>
    );
  }
}

Proposal.contextTypes = {
  router: React.PropTypes.object.isRequired
};

let select = (store) => {
  return { fit: store.fit, user: store.user};
};

export default connect(select)(Proposal);
