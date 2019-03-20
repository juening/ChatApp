import * as actionTypes from "../actions/actionTypes";
import { combineReducers } from "redux";

/* user reducer */
const initialUserState = { loading: true, user: null };

const userReducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        loading: false,
        user: action.payload.currentUser
      };

    case actionTypes.CLEAR_USER:
      return {
        ...initialUserState,
        loading: false
      };

    default:
      return state;
  }
};

/* channel reducer */
const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false,
  userPosts: null
};

const channelReducer = (state = initialChannelState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel
      };

    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel
      };

    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts
      };

    default:
      return state;
  }
};

/* color reducer */

const initialColorsState = {
  primaryColor: "#4c3c4c",
  secondaryColor: "#eee"
};

const colorReducer = (state = initialColorsState, action) => {
  switch (action.type) {
    case actionTypes.SET_COLORS:
      return {
        ...state,
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor
      };

    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: userReducer,
  channel: channelReducer,
  colors: colorReducer
});

export default rootReducer;
