import * as actionTypes from "../actions/actionTypes";
import { combineReducers } from "redux";

const initialUserState = { loading: true, user: null };

const userReducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        loading: false,
        user: action.payload.currentUser
      };

    default:
      return state;
  }
};

const rootReducer = combineReducers({ user: userReducer });

export default rootReducer;