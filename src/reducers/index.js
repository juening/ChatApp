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
const initialChannelState = { currentChannel: null, isPrivateChannel: false };

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

    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: userReducer,
  channel: channelReducer
});

export default rootReducer;
