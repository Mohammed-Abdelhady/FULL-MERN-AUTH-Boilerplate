import { baseApi } from './baseApi';

/**
 * User interface
 */
export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  isDeleted: boolean;
  authProvider: 'email' | 'google' | 'facebook' | 'github';
  linkedProviders: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get users query params
 */
export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isVerified?: boolean;
}

/**
 * API response structure from backend
 */
interface ApiUsersResponse {
  data: Array<Omit<User, '_id'> & { id: string }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get users response (normalized for frontend)
 */
export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Create user request
 */
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: string;
}

/**
 * Update user role request
 */
export interface UpdateUserRoleRequest {
  userId: string;
  role: string;
}

/**
 * Update user status request
 */
export interface UpdateUserStatusRequest {
  userId: string;
  isActive: boolean;
}

/**
 * Update user request
 */
export interface UpdateUserRequest {
  userId: string;
  name: string;
  email: string;
}

/**
 * Users API slice for managing users
 */
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all users (admin)
     */
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.role) searchParams.append('role', params.role);
        if (params.isVerified !== undefined)
          searchParams.append('isVerified', params.isVerified.toString());

        const queryString = searchParams.toString();
        return `/api/admin/users${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: { success: boolean; data: ApiUsersResponse }) => {
        const { data, pagination } = response.data;
        return {
          users: data.map((user) => ({
            ...user,
            _id: user.id, // Map id to _id
          })),
          total: pagination.total,
          page: pagination.page,
          limit: pagination.limit,
        };
      },
      providesTags: (result) =>
        result && result.users
          ? [
              ...result.users.map(({ _id }) => ({ type: 'User' as const, id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    /**
     * Create new user (admin)
     */
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (data) => ({
        url: '/api/admin/users',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        data: Omit<User, '_id'> & { id: string };
        message: string;
      }) => {
        const { id, ...rest } = response.data;
        return {
          ...rest,
          _id: id, // Map id to _id
        };
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    /**
     * Get user by ID (admin)
     */
    getUserById: builder.query<User, string>({
      query: (userId) => `/api/admin/users/${userId}`,
      transformResponse: (response: {
        success: boolean;
        data: Omit<User, '_id'> & { id: string };
      }) => {
        const { id, ...rest } = response.data;
        return {
          ...rest,
          _id: id, // Map id to _id
        };
      },
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    /**
     * Update user information (admin)
     */
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ userId, name, email }) => ({
        url: `/api/admin/users/${userId}`,
        method: 'PATCH',
        body: { name, email },
      }),
      transformResponse: (response: {
        success: boolean;
        data: Omit<User, '_id'> & { id: string };
        message: string;
      }) => {
        const { id, ...rest } = response.data;
        return {
          ...rest,
          _id: id, // Map id to _id
        };
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    /**
     * Update user status (activate/deactivate) (admin)
     */
    updateUserStatus: builder.mutation<
      { id: string; isDeleted: boolean; deletedAt?: string },
      UpdateUserStatusRequest
    >({
      query: ({ userId, isActive }) => ({
        url: `/api/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      transformResponse: (response: {
        success: boolean;
        data: { id: string; isDeleted: boolean; deletedAt?: string };
        message: string;
      }) => response.data,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    /**
     * Update user role (admin)
     */
    updateUserRole: builder.mutation<User, UpdateUserRoleRequest>({
      query: ({ userId, role }) => ({
        url: `/api/admin/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: (response: {
        success: boolean;
        data: Omit<User, '_id'> & { id: string };
        message: string;
      }) => {
        const { id, ...rest } = response.data;
        return {
          ...rest,
          _id: id, // Map id to _id
        };
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    /**
     * Delete user (admin)
     */
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/api/admin/users/${userId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean; data: { message: string } }) =>
        response.data,
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userApi;
