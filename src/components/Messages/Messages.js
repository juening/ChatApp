import React, { Component, Fragment } from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserPosts } from "../../actions";
import firebase from "../../config/firebase";
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Typing from "./Typing";

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
    usersRef: firebase.database().ref("users"),
    typingRef: firebase.database().ref("typing"),
    connectedRef: firebase.database().ref(".info"),
    typingUsers: []
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.currentChannel !== prevProps.currentChannel) {
      const { currentChannel, currentUser } = this.props;
      this.addChannelListeners(currentChannel.id);
      this.addUserStarListener(currentChannel.id, currentUser.uid);
    }
    if (this.messagesEndRef) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messagesEndRef.scrollIntoView({ behavior: "smooth" });
  };

  addChannelListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListeners(channelId);
  };

  addTypingListeners = channelId => {
    const { currentUser } = this.props;
    let typingUsers = [];
    this.state.typingRef.child(channelId).on("child_added", snap => {
      if (snap.key !== currentUser.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });
        this.setState({ typingUsers });
      }
    });

    this.state.typingRef.child(channelId).on("child_removed", snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });

    this.state.connectedRef.on("value", snap => {
      if (snap.val()) {
        this.state.typingRef
          .child(channelId)
          .child(currentUser.uid)
          .onDisconnect()
          .remove(err => {
            if (err) {
              console.error(err);
            }
          });
      }
    });
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

  displayTypingUsers = users => {
    console.log(users);
    return (
      users.length > 0 &&
      users.map(user => (
        <div
          key={user.id}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.2em"
          }}
        >
          <span className="user__typing">{user.name} is typing </span>{" "}
          <Typing />
        </div>
      ))
    );
  };

  render() {
    const {
      messagesRef,
      messages,
      numberUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading,
      isChannelStarred,
      typingUsers
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

            {this.displayTypingUsers(typingUsers)}
            <div
              ref={node => {
                this.messagesEndRef = node;
              }}
            />
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
