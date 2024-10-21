import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthState } from '../store/auth/auth.reducer';
import { validateToken } from '../store/auth/auth.actions';
import { selectIsTokenValid } from '../store/auth/auth.selectors';

export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const store = inject(Store) as Store<{ auth: AuthState }>;
  const router = inject(Router);

  store.dispatch(validateToken());

  return store.pipe(
    select(selectIsTokenValid),
    take(1),
    map(isValid => {
      if (isValid) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
