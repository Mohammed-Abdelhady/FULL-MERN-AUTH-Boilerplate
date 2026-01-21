import { baseApi } from '@/store/api/baseApi';
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  ListRolesQuery,
  ListRolesResponse,
} from '../types';

/**
 * Roles API slice with role management endpoints
 */
export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all roles with pagination
     */
    listRoles: builder.query<ListRolesResponse, ListRolesQuery | undefined>({
      query: (params = {}) => ({
        url: '/api/roles',
        params,
      }),
      transformResponse: (response: { success: boolean; data: ListRolesResponse }) => response.data,
      providesTags: ['Roles'],
    }),

    /**
     * Get single role by ID or slug
     */
    getRole: builder.query<Role, string>({
      query: (idOrSlug) => `/api/roles/${idOrSlug}`,
      transformResponse: (response: { success: boolean; data: Role }) => response.data,
      providesTags: (result, error, idOrSlug) => [{ type: 'Roles', id: idOrSlug }],
    }),

    /**
     * Create new role
     */
    createRole: builder.mutation<Role, CreateRoleRequest>({
      query: (data) => ({
        url: '/api/roles',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: Role; message: string }) =>
        response.data,
      invalidatesTags: ['Roles'],
    }),

    /**
     * Update existing role
     */
    updateRole: builder.mutation<Role, { idOrSlug: string; data: UpdateRoleRequest }>({
      query: ({ idOrSlug, data }) => ({
        url: `/api/roles/${idOrSlug}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: Role; message: string }) =>
        response.data,
      invalidatesTags: (result, error, { idOrSlug }) => ['Roles', { type: 'Roles', id: idOrSlug }],
    }),

    /**
     * Delete role
     */
    deleteRole: builder.mutation<void, string>({
      query: (idOrSlug) => ({
        url: `/api/roles/${idOrSlug}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const {
  useListRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
