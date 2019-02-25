import React, { Component } from "react";
import uuidv4 from "uuid/v4";
import { Segment, Button, Input } from "semantic-ui-react";

import firebase from "../../config/firebase";
import FileModal from "./FileModal";

export default class MessageForm extends Component {
  state = {
    message: "",
    loading: false,
    errors: [],
    modal: false
  };

  closeModal = () => this.setState({ modal: false });

  openModal = () => this.setState({ modal: true });

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  createMessage = () => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      content: this.state.message,
      user: {
        id: this.props.currentUser.uid,
        name: this.props.currentUser.name,
        avatar: this.props.currentUser.photoURL
      }
    };
    return JSON.parse(JSON.stringify(message));
  };

  sendMessage = () => {
    const { messagesRef, currentChannel } = this.props;
    const { message } = this.state;

    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(currentChannel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch(err => {
          // console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" })
      });
    }
  };

  uploadFile = (file, metadata) => {
    console.log(file, metadata);
  };

  render() {
    const { errors, message, modal } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          style={{ marginBottom: "0.7em" }}
          label={<Button icon={"add"} />}
          labelPosition="left"
          onChange={this.handleChange}
          placeholder="Write your message"
          value={message}
          className={
            errors.some(err => err.message.includes("message")) ? "error" : ""
          }
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            onClick={this.openModal}
          />
          <FileModal
            uploadFile={this.uploadFile}
            modal={modal}
            closeModal={this.closeModal}
          />
        </Button.Group>
      </Segment>
    );
  }
}