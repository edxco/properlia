"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type PropertyDraft,
  type PropertyDraftMedia,
} from "./propertyDraft";

const SAVE_DELAY_MS = 500;

interface Options<F> {
  userId: string | undefined;
  enabled: boolean;
  fields: F;
  media: PropertyDraftMedia;
  isEmpty: (fields: F, media: PropertyDraftMedia) => boolean;
  onRestore: (draft: PropertyDraft<F>) => void;
}

export function usePropertyDraft<F>({
  userId,
  enabled,
  fields,
  media,
  isEmpty,
  onRestore,
}: Options<F>) {
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const onRestoreRef = useRef(onRestore);
  useEffect(() => {
    onRestoreRef.current = onRestore;
  });
  const suspendedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !userId) return;
    let cancelled = false;
    loadDraft<F>(userId).then((draft) => {
      if (cancelled) return;
      if (draft) {
        onRestoreRef.current(draft);
        setRestored(true);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled || !userId || !ready || suspendedRef.current) return;
    const timer = setTimeout(() => {
      if (suspendedRef.current) return;
      if (isEmpty(fields, media)) {
        clearDraft(userId);
      } else {
        saveDraft(userId, fields, media);
      }
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, userId, ready, fields, media, isEmpty]);

  const discard = useCallback(async () => {
    suspendedRef.current = true;
    if (userId) await clearDraft(userId);
    setRestored(false);
    suspendedRef.current = false;
  }, [userId]);

  const clear = useCallback(async () => {
    suspendedRef.current = true;
    setRestored(false);
    if (userId) await clearDraft(userId);
  }, [userId]);

  return { restored, dismissBanner: () => setRestored(false), discard, clear };
}
