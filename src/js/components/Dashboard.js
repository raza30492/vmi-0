import React, {Component} from 'react';
import { connect } from 'react-redux';
import history from '../history';



import AppHeader from './AppHeader';
import Box from 'grommet/components/Box';
import Section from 'grommet/components/Section';

class Dashboard extends Component {
  constructor () {
	  super();

  }

  componentWillMount () {
    const {token} = window.sessionStorage;
    if ((token == null || token == 'null' )) {
      //this.context.router.push('/logon');
      history.push('/logon');
    }
  }

  render () {

    return (
		  <Box>
		    <AppHeader page="Home" />
        <Section>
          <Box alignSelf="center">
            <h1>Welcome to Vendor Managed Inventory Application!</h1>
          </Box>
        </Section>

			</Box>
    );
  }
}

// Dashboard.contextTypes = {
//   router: React.PropTypes.object.isRequired
// };

let select = (store) => {
  return { nav: store.nav, user: store.user};
};

export default connect(select)(Dashboard);
