import React, { Component } from "react";
import { Grid, Header, Dropdown, Icon } from "semantic-ui-react";

class UserPanel extends Component {
  dropdownOptions = () => [
    {
      text: (
        <span>
          Sign in as <strong>User</strong>
        </span>
      ),
      disabled: true,
      key: "user"
    },
    {
      text: <span>Changed Avatar</span>,
      key: "avatar"
    },
    {
      text: <span>Sign Out</span>,
      key: "signout"
    }
  ];

  render() {
    return (
      <Grid style={{ background: "4c3c4c" }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            <Header inverted floated="left" as="h2">
              {/* Main App header*/}
              <Icon name="cart" />
              <Header.Content>Shopping Chat</Header.Content>
            </Header>
          </Grid.Row>
          <Header style={{ padding: "0.25em" }} as="h4" inverted>
            <Dropdown
              trigger={<span>User</span>}
              options={this.dropdownOptions()}
            />
          </Header>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
