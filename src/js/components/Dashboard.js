import React, {Component} from 'react';
import { connect } from 'react-redux';

import Header from 'grommet/components/Header';
//import Title from 'grommet/components/Title';

import AppHeader from './AppHeader';


class Dashboard extends Component {
  constructor () {
	  super();

  }

  render () {

    return (
		  <div>
		    <Header>
			    <AppHeader />
			  </Header>
        <div>
        <h1>Welcome to Dashboard!</h1>
        <form method="POST" action="http://localhost:8080/api/upload" encType="multipart/form-data">
          File1 to upload: <input type="file" name="file" /><br/>

          Name1: <input type="text" name="name" /><br/>

          <input type="submit" value="Upload" /> Press here to upload the file!
        </form>
        </div>

			</div>
    );
  }
}

let select = (store) => {
  return { nav: store.nav};
};

export default connect(select)(Dashboard);
