import React, { Component, Fragment } from "react";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from "semantic-ui-react";
import { SliderPicker } from "react-color";
import { connect } from "react-redux";
import { setColors } from "../../actions";
import firebase from "../../config/firebase";

class ColorPanel extends Component {
  state = {
    modal: false,
    primaryColor: "",
    secondaryColor: "",
    usersRef: firebase.database().ref("users")
  };

  componentDidMount() {
    if (this.props.currentUser) {
      this.addListeners(this.props.currentUser.uid);
    }
  }

  addListeners = userId => {
    let userColors = [];
    this.state.usersRef.child(`{userId}/colors`).on("child_added", snap => {
      userColors.unshift(snap.val());
      this.setState({ userColors });
    });
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handlePrimaryChange = color => this.setState({ primaryColor: color.hex });

  handleSecondaryChange = color => this.setState({ secondaryColor: color.hex });

  handleSaveColors = () => {
    const { primaryColor, secondaryColor } = this.state;
    if (primaryColor && secondaryColor) {
      this.saveColors(primaryColor, secondaryColor);
    }
  };

  saveColors = (color1, color2) => {
    const userId = this.props.currentUser.uid;
    this.state.usersRef
      .child(`{userId}/colors`)
      .push()
      .update({
        primary: color1,
        secondary: color2
      })
      .then(() => {
        this.closeModal();
      })
      .catch(err => console.error(err));
  };

  displayUserColors = colors =>
    colors &&
    colors.map((color, i) => (
      <Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => this.props.setColors(color.primary, color.secondary)}
        >
          <div className="color__square" style={{ background: color.primary }}>
            <div
              className="color__overlay"
              style={{ background: color.secondary }}
            />
          </div>
        </div>
      </Fragment>
    ));

  render() {
    const { modal, primaryColor, secondaryColor, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Segment>
            <Label content="Primary Color" />
            <SliderPicker
              onChange={this.handlePrimaryChange}
              color={primaryColor}
            />
          </Segment>
          <Segment>
            <Label content="Secondary Color" />
            <SliderPicker
              onChange={this.handleSecondaryChange}
              color={secondaryColor}
            />
          </Segment>
          <Modal.Content />
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(
  null,
  { setColors }
)(ColorPanel);
