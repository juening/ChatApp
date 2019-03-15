import React, { Component, Fragment } from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserPosts } from "../../actions";
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
    searchResults: [],
    isChannelStarred: false,
    usersRef: firebase.database().ref("users")
  };

  componentDidUpdate(prevProps) {
    if (this.props.currentChannel !== prevProps.currentChannel) {
      const { currentChannel, currentUser } = this.props;
      this.addChannelListeners(currentChannel.id);
      this.addUserStarListener(currentChannel.id, currentUser.uid);
    }
  }

  addChannelListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    const ref = this.getMessageRef();
    let loadedMessages = [];
    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({ messages: loadedMessages, messagesLoading: false });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
  };

  addUserStarListener = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val()) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
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

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      // console.log(message);
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
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

  handleStar = () => {
    this.setState(
      prevState => ({
        isChannelStarred: !prevState.isChannelStarred
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    const { currentChannel, currentUser } = this.props;
    if (this.state.isChannelStarred) {
      this.state.usersRef.child(`${currentUser.uid}/starred`).update({
        [currentChannel.id]: {
          name: currentChannel.name,
          details: currentChannel.details,
          createdBy: {
            name: currentChannel.createdBy.name,
            avatar: currentChannel.createdBy.avatar
          }
        }
      });
    } else {
      this.state.usersRef
        .child(`${currentUser.uid}/starred`)
        .child(currentChannel.id)
        .remove(err => {
          if (err) {
            console.error(err);
          }
        });
    }
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
      searchLoading,
      isChannelStarred
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
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
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

export default connect(
  null,
  { setUserPosts }
)(Messages);
