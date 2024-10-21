import { createAction, props } from '@ngrx/store';
import { User } from '../../../core/api/v1';

export const login = createAction('[Auth] Login', props<{ user: User }>());

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const validateToken = createAction('[Auth] Validate Token');

export const logout = createAction('[Auth] Logout');
