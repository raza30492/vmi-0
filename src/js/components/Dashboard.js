import React, {Component} from 'react';
import { connect } from 'react-redux';
import history from '../history';

//import Header from 'grommet/components/Header';
//import Title from 'grommet/components/Title';

import AppHeader from './AppHeader';


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
		  <div>
			    <AppHeader page="Home" />
        <div>
          <h1>Welcome to Dashboard!</h1>
        </div>

			</div>
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
