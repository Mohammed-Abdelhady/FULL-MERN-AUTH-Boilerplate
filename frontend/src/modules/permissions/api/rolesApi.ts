import { baseApi } from '@/store/api/baseApi';

/**
 * Role data structure
 */
export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystemRole: boolean;
  isProtected: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create role request payload
 */
export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

/**
 * Update role request payload
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

/**
 * List roles query parameters
 */
export interface ListRolesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * List roles response
 */
export interface ListRolesResponse {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

// Export hooks
export const {
  useListRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
