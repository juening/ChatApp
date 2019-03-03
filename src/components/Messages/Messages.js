import React, { Component, Fragment } from "react";
import { Segment, Comment } from "semantic-ui-react";
import firebase from "../../config/firebase";
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    privateMessageRef: firebase.database().ref("privateMessages"),
    messages: [],
    messagesLoading: true,
    numberUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: []
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentChannel !== prevProps.currentChannel) {
      const { currentChannel } = this.props;
      this.addListeners(currentChannel.id);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    const ref = this.getMessageRef();
    let loadedMessages = [];
    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({ messages: loadedMessages, messagesLoading: false });
      this.countUniqueUsers(loadedMessages);
    });
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numberUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({ numberUniqueUsers });
  };

  /* need to be corrected to show no message channel   */
  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        message={message}
        key={message.timestamp}
        user={this.props.currentUser}
      />
    ));

  /* display channel name on message header */
  displayChannelName = channel => {
    return channel
      ? `${this.props.isPrivateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  /* handle search string changes */
  handleSearchChange = event => {
    this.setState({ searchTerm: event.target.value, searchLoading: true }, () =>
      this.handleSearchMessages()
    );
  };

  /* handle search messages & users */
  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        (message.user.name && message.user.name.match(regex))
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  getMessageRef = () => {
    const { messagesRef, privateMessageRef } = this.state;
    const { isPrivateChannel } = this.props;
    return isPrivateChannel ? privateMessageRef : messagesRef;
  };

  render() {
    const {
      messagesRef,
      messages,
      numberUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading
    } = this.state;
    // console.log(messages);
    return (
      <Fragment>
        <MessageHeader
          channelName={this.displayChannelName(this.props.currentChannel)}
          numberUniqueUsers={numberUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={this.props.isPrivateChannel}
        />
        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          {...this.props}
          getMessageRef={this.getMessageRef}
        />
      </Fragment>
    );
  }
}

export default Messages;
