import React, { Component } from "react";
import {
  Grid,
  Header,
  Dropdown,
  Icon,
  Image,
  Modal,
  Input,
  Button
} from "semantic-ui-react";
import AvatarEditor from "react-avatar-editor";
import firebase from "../../config/firebase";

class UserPanel extends Component {
  state = {
    modal: false,
    previewImage: "",
    blob: "",
    croppedImage: "",
    uploadedCroppedImage: "",
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref("users"),
    metadata: {
      contentType: "image/jpeg"
    }
  };

  dropdownOptions = () => [
    {
      text: (
        <span>
          Sign in as <strong>{this.props.currentUser.displayName}</strong>
        </span>
      ),
      disabled: true,
      key: "user"
    },
    {
      text: <span onClick={this.openModal}>Change Avatar</span>,
      key: "avatar"
    },
    {
      text: <span onClick={this.handleSignout}>Sign Out</span>,
      key: "signout"
    }
  ];

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("Signed Out."));
  };

  handleImageChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleImageCrop = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        const imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };

  uploadCroppedImage = () => {
    const { storageRef, userRef, metadata, blob } = this.state;
    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedCroppedImage: downloadURL }, () =>
            this.changeAvatar()
          );
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedCroppedImage
      })
      .then(() => {
        console.log("PhotoURL updated");
        this.closeModal();
      })
      .catch(err => {
        console.error(err);
      });

    this.state.usersRef
      .child(this.state.userRef.uid)
      .update({ avatar: this.state.uploadedCroppedImage })
      .then(() => {
        console.log("user avatar updated");
      })
      .catch(err => {
        console.error(err);
      });
  };

  render() {
    const { currentUser, primaryColor } = this.props;
    const { modal, previewImage, croppedImage } = this.state;

    return (
      <Grid style={{ background: primaryColor }}>
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
              trigger={
                <span>
                  <Image src={currentUser.photoURL} spaced="right" avatar />
                  {currentUser.displayName}
                </span>
              }
              options={this.dropdownOptions()}
            />
          </Header>
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
                onChange={this.handleImageChange}
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={150}
                        height={150}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button
                  color="green"
                  inverted
                  onClick={this.uploadCroppedImage}
                >
                  <Icon name="save" /> Change Avatar
                </Button>
              )}
              <Button color="green" onClick={this.handleImageCrop} inverted>
                <Icon name="image" /> Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="save" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
