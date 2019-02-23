import React, { Component, Fragment } from "react";
import { Segment, Comment } from "semantic-ui-react";
import firebase from "../../config/firebase";
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true
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
    let loadedMessages = [];
    this.state.messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());

      this.setState({ messages: loadedMessages, messagesLoading: false });
    });
  };

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        message={message}
        key={message.timestamp}
        user={this.props.currentUser}
      />
    ));

  render() {
    const { messagesRef, messages } = this.state;
    console.log(messages);
    return (
      <Fragment>
        <MessageHeader />
        <Segment>
          <Comment.Group className="messages">
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm messagesRef={messagesRef} {...this.props} />
      </Fragment>
    );
  }
}

export default Messages;
