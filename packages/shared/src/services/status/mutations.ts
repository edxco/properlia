import { useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyApi } from "./api";
import type { ICreatePropertyDto, IUpdatePropertyDto } from "./types";

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreatePropertyDto) => propertyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdatePropertyDto }) =>
      propertyApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", data.data.id] });
    },
  });
};

export const useDeletePropertyAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      attachmentId,
    }: {
      propertyId: string;
      attachmentId: string;
    }) => propertyApi.deleteAttachment(propertyId, attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({
        queryKey: ["properties", variables.propertyId],
      });
    },
  });
};
