import React from "react";
import { Grid } from "semantic-ui-react";
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";
import { connect } from "react-redux";
import "./App.css";

const App = ({
  currentUser,
  currentChannel,
  isPrivateChannel,
  userPosts,
  primaryColor,
  secondaryColor
}) => (
  <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
    <ColorPanel
      currentUser={currentUser}
      key={currentUser && currentUser.name}
    />
    <SidePanel
      currentUser={currentUser}
      key={currentUser && currentUser.uid}
      primaryColor={primaryColor}
    />
    <Grid.Column style={{ marginLeft: 320 }}>
      <Messages
        currentChannel={currentChannel}
        currentUser={currentUser}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>
    <Grid.Column width={4}>
      <MetaPanel
        key={currentChannel && currentChannel.id}
        isPrivateChannel={isPrivateChannel}
        currentChannel={currentChannel}
        userPosts={userPosts}
      />
    </Grid.Column>
  </Grid>
);

const mapStateToProps = state => {
  return {
    currentUser: state.user.user,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel,
    userPosts: state.channel.userPosts,
    primaryColor: state.colors.primaryColor,
    secondaryColor: state.colors.secondaryColor
  };
};

export default connect(mapStateToProps)(App);
