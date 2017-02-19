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
      data: {}, //request data for Calculate rest call
      skuFlag: false, // Show missing Sku Layer
      missingSkus: [],
      errors: []
    };
  }

  componentWillMount () {
    //calculating 15 years array
    const curYear = new Date().getFullYear();
    let years = [];
    for (var i = 0; i < 15; i++) {
      years.push((curYear-i).toString());
    }
    this.setState({years: years, year: years[0], localeData:localeData()});

    if (!this.props.fit.loaded && sessionStorage.buyerName != 'undefined') {
      this.props.dispatch(getFits(sessionStorage.buyerName));
    }else if (this.props.fit.fits.length != 0) {
      this.setState({fitName: this.props.fit.fits[0].name});
      this._getProposals(this.props.fit.fits[0].name, years[0]);
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
      this._getProposals(nextProps.fit.fits[0].name, this.state.year);
    }
  }

  _getProposals (fitName, year) {
    const options = {method: 'GET', headers: {...headers, Authorization: 'Basic ' + sessionStorage.token}};
    //fetch main Proposals
    let url = window.serviceHost + '/proposals/main/' + year + '?fitName=' + fitName;
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
    url = window.serviceHost + '/proposals/summary/' + year + '?fitName=' + fitName;
    fetch(url, options)
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      this.setState({summaryProposals: data});
    })
    .catch(error => {
      console.log(error);
      //alert('Some Error occured loading data');
    });
  }

  _calculateProposal () {
    const { data, fitName } = this.state;
    let errors = [];
    let isError = false;
    const regexYear = /^\d{4}$/;
    const regexWeek = /^\d{1,2}$/;
    const regexNumber = /^\d*$/;
    if (data.year == '' || data.year == undefined) {
      errors[0] = "Year cannot be blank";
      isError = true;
    } else if (!regexYear.test(data.year)) {
      errors[0] = "Invalid year";
      isError = true;
    }
    if (data.week1 == '' || data.week1 == undefined) {
      errors[1] = "Week1 value cannot be blank";
      isError = true;
    } else if (!regexWeek.test(data.week1)) {
      errors[1] = "Invalid Week";
      isError = true;
    }
    if (!(data.week2 == '' || data.week2 == undefined) && (!regexWeek.test(data.week2))) {
      errors[2] = "Invalid week";
      isError = true;
    }
    if (!(data.week3 == '' || data.week3 == undefined) && (!regexWeek.test(data.week3))) {
      errors[3] = "Invalid week";
      isError = true;
    }
    if (!(data.week4 == '' || data.week4 == undefined) && (!regexWeek.test(data.week4))) {
      errors[4] = "Invalid week";
      isError = true;
    }
    if (data.salesForcast == '' || data.salesForcast == undefined) {
      errors[5] = "Sales Forcast cannot be blank";
      isError = true;
    } else if (!regexNumber.test(data.salesForcast)) {
      errors[5] = "Enter number without ,";
      isError = true;
    }
    if (data.cumSalesForcast == '' || data.cumSalesForcast == undefined) {
      errors[6] = "Cummulative Sales Forcast cannot be blank";
      isError = true;
    } else if (!regexNumber.test(data.cumSalesForcast)) {
      errors[6] = "Enter number without ,";
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
        this._getProposals(fitName,this.state.year);
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

  _onFitFilter (e) {
    this.setState({fitName: e.value});
    this._getProposals(e.value, this.state.year);
  }

  _onChange (e) {
    this.setState({year: e.value});
    this._getProposals(this.state.fitName, e.value);
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
    this._getProposals(this.state.fitName, this.state.year);
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
    const { localeData, fitName, year, years, mainProposals, summaryProposals, calculating, data, isClose, status, message, skuFlag, missingSkus, errors, isBusy } = this.state;

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
            <FormField label="Week2" error={errors[2]} >
              <input type="text" name="week2" value={data.week2} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week3" error={errors[3]}>
              <input type="text" name="week3" value={data.week3} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Week4" error={errors[4]} >
              <input type="text" name="week4" value={data.week4} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Sale Forcast for proposed Week" error={errors[5]}>
              <input type="text" name="salesForcast" value={data.salesForcast} onChange={this._onChangeInput.bind(this)} />
            </FormField>
            <FormField label="Cummulative Forcast upto proposed Week" error={errors[6]}>
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
            <Box><Select   options={years} value={year} onChange={this._onChange.bind(this)} /></Box>
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
