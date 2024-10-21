import { createReducer, on } from '@ngrx/store';
import { loginSuccess, loginFailure, logout } from './auth.actions';

export interface AuthState {
  token: string | null;
  error: string | null;
  isTokenValid: boolean;
}

export const initialState: AuthState = {
  token: localStorage.getItem('authToken'),
  error: null,
  isTokenValid: false,
};

export const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { token }) => {
    localStorage.setItem('authToken', token);
    return {
      ...state,
      token: token,
      error: null,
      isTokenValid: true,
    };
  }),
  on(loginFailure, (state, { error }) => ({
    ...state,
    error,
    isTokenValid: false,
  })),
  on(logout, state => {
    localStorage.removeItem('authToken');
    return { ...state, token: null, isTokenValid: false };
  })
);
