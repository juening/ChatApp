import React, { Component } from "react";
import { Header, Segment, Icon, Input } from "semantic-ui-react";

export default class MessageHeader extends Component {
  render() {
    const {
      channelName,
      numberUniqueUsers,
      handleSearchChange,
      searchLoading,
      isPrivateChannel
    } = this.props;
    return (
      <Segment clearing>
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channelName}
            {!isPrivateChannel && <Icon name={"star outline"} color="black" />}
          </span>
          <Header.Subheader>{numberUniqueUsers} </Header.Subheader>
        </Header>
        <Header floated="right">
          <Input
            loading={searchLoading}
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
            onChange={handleSearchChange}
          />
        </Header>
      </Segment>
    );
  }
}
