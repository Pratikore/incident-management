import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, listUsers } from '../api/client';
import type { CreateUserRequest } from '../types/auth';

const usersKey = ['users'] as const;

export function useUsers() {
  return useQuery({ queryKey: usersKey, queryFn: listUsers });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserRequest) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey });
    },
  });
}
