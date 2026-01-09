'use client';

import { useQuery } from '@tanstack/react-query';
import { listingTypeApi } from '@properlia/shared/services/listing-types/api';

export const useListingTypes = () =>
  useQuery({
    queryKey: ['listing-types'],
    queryFn: listingTypeApi.getAll,
    select: (response) => response.data,
  });
