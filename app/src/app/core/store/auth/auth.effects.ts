import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AuthService } from '../../../core/api/v1';
import {
  login,
  loginSuccess,
  loginFailure,
  validateToken,
  logout,
} from './auth.actions';

import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  private isTokenExpired(token: string): boolean {
    if (!token) {
      return true;
    }

    try {
      const decoded: { exp?: number } = jwtDecode(token);

      if (!decoded.exp) {
        return true;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      mergeMap(action =>
        this.authService.apiAuthLoginPost(action.user).pipe(
          map(response => {
            const token = response.token ?? '';
            return loginSuccess({ token });
          }),
          catchError(() =>
            of(
              loginFailure({
                error: 'Login failed. Please check your email and password.',
              })
            )
          )
        )
      )
    )
  );

  validateToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validateToken),
      mergeMap(() => {
        const token = localStorage.getItem('authToken');
        if (token && !this.isTokenExpired(token)) {
          return of(loginSuccess({ token }));
        } else {
          return of(logout());
        }
      })
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        map(() => {
          localStorage.removeItem('authToken');
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );
}
