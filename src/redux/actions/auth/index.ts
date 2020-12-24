import { createAction } from '@reduxjs/toolkit';

import { signup, signin, authenticate } from '../../../api/auth';
import { AppThunk } from '../../reducers/rootReducer';

type OnchangePayloadType ={
    id: string,
    value: string,
    inputErr: {[k: string]: boolean}
}

export type SignupState = {
    username: string,
    email: string,
    password: string,
    isLoading: boolean,
    signupSuccessful: boolean,
    inputError: {[k: string]: boolean},
    serverError: string,
}

export type SigninState = {
    email: string,
    password: string,
    isLoading: boolean,
    signinSuccessful: boolean,
    inputError: {[k: string]: boolean},
    serverError: string,
}

export type OnChangePayload = {
    id: string,
    value: string,
    inputErr: {[k: string]: boolean}
}

type SignupRequestData = {
    username: string,
    email: string,
    password: string,
}

type SigninRequestData = {
    email: string,
    password: string,
}

export const signinInitialState: SigninState = {
  email: '',
  password: '',
  isLoading: false,
  signinSuccessful: false,
  inputError: {},
  serverError: '',
};

export const signupInitialState: SignupState = {
  username: '',
  email: '',
  password: '',
  isLoading: false,
  signupSuccessful: false,
  inputError: {},
  serverError: '',
};

export const onChange = createAction<OnchangePayloadType>('ON_CHANGE');
export const setInputError = createAction<{[k: string]: boolean}>('SET_INPUT_ERROR');
export const setServerError = createAction<string>('SET_SERVER_ERROR');
export const setLoading = createAction<boolean>('SET_LOADING');
export const reset = createAction<SignupState | SigninState>('RESET');
export const signinSuccess = createAction<SigninState>('SIGNIN_SUCCESSFUL');
export const signupSuccess = createAction<SignupState>('SIGNUP_SUCCESSFUL');

export function signupAction(signupData: SignupRequestData): AppThunk {
  return async (dispatch) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    signup(signupData)
      .then((resp) => {
        if (resp.success) {
          authenticate(resp, () => {
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'SIGNUP_SUCCESSFUL', payload: true });
            dispatch({ type: 'RESET', payload: signupInitialState });
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_SERVER_ERROR', payload: 'username or email already exists' });
        }
      })
      .catch((err) => {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_SERVER_ERROR', payload: err.message });
      });
  };
}

export function signinAction(signinData: SigninRequestData): AppThunk {
  return async (dispatch) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    signin(signinData)
      .then((resp) => {
        if (resp.success) {
          authenticate(resp, () => {
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'SIGNIN_SUCCESSFUL', payload: true });
            dispatch({ type: 'RESET', payload: signinInitialState });
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_SERVER_ERROR', payload: resp.message });
        }
      })
      .catch((err) => {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_SERVER_ERROR', payload: err.message });
      });
  };
}