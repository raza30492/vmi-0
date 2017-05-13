import React, {Component} from 'react';
import { connect } from 'react-redux';
import { ROLE_MERCHANT, ROLE_USER } from '../utils/util';
import { getFits } from '../actions';
import { localeData } from '../reducers/localization';
import { handleErrors, headers } from '../utils/restUtil';

import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import DocumentDownload from "grommet/components/icons/base/DocumentDownload";
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import ListPlaceholder from 'grommet-addons/components/ListPlaceholder';
import Section from 'grommet/components/Section';
import Select from 'grommet/components/Select';
import Tab from 'grommet/components/Tab';
import Tabs from 'grommet/components/Tabs';
import Toast from 'grommet/components/Toast';

class Dashboard extends Component {
  constructor () {
	  super();
    this.state = {
      message: '',
      showToast: false,
      showBuyerFilter: false,
      buyerName: 'Select Buyer',
      fitName: '',
      mainProposals: [],
      summaryProposals: []
    };
  }

  componentWillMount () {
    this.setState({localeData: localeData()});

    const {token} = window.sessionStorage;
    if ((token == null )) {
      this.context.router.push('/logon');
    }

    //calculating 15 years array
    const curYear = new Date().getFullYear();
    let years = [];
    for (var i = 0; i < 15; i++) {
      years.push((curYear-i).toString());
    }
    this.setState({years: years, year: years[0]});
    if (!this.props.fit.loaded && sessionStorage.buyerName != 'undefined') {
      this.props.dispatch(getFits(sessionStorage.buyerName));
    }
    if (this.props.fit.fits.length != 0) {
      this.setState({fitName: this.props.fit.fits[0].name});
      this._getProposals(this.props.fit.fits[0].name, years[0]);
    }else{
      // if (sessionStorage.privilege != 'USER') {
      //   alert('Add Fits, SKUs and upload sales data first!');
      //   this.context.router.push('/fit');
      // }
    }
  }

  componentDidMount () {
    const { role, buyerName, privilege } = window.sessionStorage;
    if (privilege == 'USER' && (buyerName == 'undefined')) {
      if (role == ROLE_MERCHANT) {
        const message = "You need to select buyer in app header before proceeding further since you do not have buyer access.Contact Administrator for buyer access.";
        this.setState({showToast: true, message: message});
      }
      if (role == ROLE_USER) {
        const message = "You need to select buyer in app header before proceeding further.";
        this.setState({showToast: true, message: message});
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.fit.loaded && nextProps.fit.loaded && nextProps.fit.fits.length == 0) {
      // if (sessionStorage.privilege != 'USER') {
      //   alert('Add Fits, SKUs and upload sales data first!');
      //   this.context.router.push('/fit');
      // }
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
      //alert('Some Error occured loading data');
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
      alert('Some Error occured loading data');
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

  _onCloseToast () {
    this.setState({showToast: false});
  }

  _onFitFilter (e) {
    this.setState({fitName: e.value});
    this._getProposals(e.value, this.state.year);
  }

  _onChange (e) {
    this.setState({year: e.value});
    this._getProposals(this.state.fitName, e.value);
  }

  render () {
    const {fits} = this.props.fit;
    const { showToast, message, localeData, mainProposals, summaryProposals,fitName, year, years } = this.state;
    const toast = !showToast ? null :<Toast status="ok" onClose={this._onCloseToast.bind(this)}>{message}</Toast>;
    if (sessionStorage.privilege == 'ADMIN') {
      return (
        <Box>
  		    <AppHeader page={localeData.label_home} />
          <Section>
            <Box alignSelf="center">
              <h1>Welcome to Vendor Managed Inventory Application</h1>
            </Box>
          </Section>
  			</Box>
      );
    }

    if (fits.length == 0) {
      return (
        <Box>
  		    <AppHeader page={localeData.label_home} />
          <Section>
            {toast}
            <Box alignSelf="center">
              <h1>No data available</h1>
            </Box>
          </Section>
  			</Box>
      );
    }


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


    return (
		  <Box>
		    <AppHeader page={localeData.label_home} />
        <Section direction="column" pad={{vertical: 'large', horizontal:'small'}}>
          {toast}
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
        </Section>
			</Box>
    );
  }
}

Dashboard.contextTypes = {
  router: React.PropTypes.object.isRequired
};

let select = (store) => {
  return { nav: store.nav, user: store.user, buyer: store.buyer, fit: store.fit};
};

export default connect(select)(Dashboard);
