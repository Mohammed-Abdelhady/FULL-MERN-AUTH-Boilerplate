import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/**
 * Typed version of the `useDispatch` hook from react-redux
 * Use throughout the app instead of plain `useDispatch`
 * Provides correct typing for thunks and actions
 *
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(someAsyncThunk());
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed version of the `useSelector` hook from react-redux
 * Use throughout the app instead of plain `useSelector`
 * Provides autocomplete for state properties
 *
 * @example
 * const user = useAppSelector((state) => state.auth.user);
 */
export const useAppSelector = useSelector.withTypes<RootState>();
