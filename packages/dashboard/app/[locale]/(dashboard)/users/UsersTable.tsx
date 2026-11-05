"use client";

import { useState } from "react";
import type {
  AdminUser,
  AdminUserFilters,
  UserRole,
} from "@properlia/shared/services/users/types";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";
import {
  Mail,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  UserPlus,
} from "lucide-react";
import { useUpdateUser, useCreateUser } from "@/src/services/users/queries";
import {
  Badge,
  PasswordInput,
  Button,
  Card,
  Chip,
  Field,
  Input,
  Select,
  type BadgeTone,
} from "@properlia/shared/components/ui";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  metadata?: {
    count: number;
    page: number;
    pages: number;
  };
  filters: AdminUserFilters;
  onFilterChange: (filters: Partial<AdminUserFilters>) => void;
}

const ROLE_OPTIONS: UserRole[] = ["user", "staff", "admin"];

const ROLE_BADGE_TONES: Record<UserRole, BadgeTone> = {
  admin: "navy",
  staff: "info",
  user: "neutral",
};

interface EditFormState {
  name: string;
  role: UserRole;
  password: string;
  password_confirmation: string;
  enabled: boolean;
}

interface CreateFormState {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  password_confirmation: string;
  enabled: boolean;
}

function UserEditRow({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const t = useT();
  const updateMutation = useUpdateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<EditFormState>({
    name: user.name || "",
    role: user.role || "user",
    password: "",
    password_confirmation: "",
    enabled: user.enabled ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: Partial<EditFormState> = {
      name: form.name,
      role: form.role,
      enabled: form.enabled,
    };

    // Only include password if provided
    if (form.password) {
      updateData.password = form.password;
      updateData.password_confirmation = form.password_confirmation;
    }

    try {
      await updateMutation.mutateAsync({ id: user.id, data: updateData });
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const passwordMismatch = !!(
    form.password && form.password !== form.password_confirmation
  );

  return (
    <div className="px-6 py-4 bg-brand-bg border-t border-brand-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label={t("name")}>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("enterName")}
            />
          </Field>

          <Field label={t("role")}>
            <Select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {capitalizeFirstWord(role)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("newPassword")}>
            <PasswordInput
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t("leaveBlankToKeep")}
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
              visible={showPassword}
              onVisibleChange={setShowPassword}
            />
          </Field>

          <Field label={t("confirmPassword")}>
            <Input
              type={showPassword ? "text" : "password"}
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              placeholder={t("confirmPassword")}
              disabled={!form.password}
              invalid={passwordMismatch}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="h-4 w-4 accent-brand-blue"
            />
            <span className="text-sm font-medium text-brand-carbon">
              {t("enabled")}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending || passwordMismatch}
            >
              <Check className="h-4 w-4" />
              {updateMutation.isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </div>

        {passwordMismatch && (
          <p className="text-sm text-danger">{t("passwordsDoNotMatch")}</p>
        )}
      </form>
    </div>
  );
}

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const t = useT();
  const createMutation = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<CreateFormState>({
    email: "",
    name: "",
    role: "user",
    password: "",
    password_confirmation: "",
    enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync(form);
      onClose();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const isValid =
    form.email &&
    form.password &&
    form.password === form.password_confirmation &&
    form.password.length >= 6;

  const passwordMismatch = !!(
    form.password && form.password !== form.password_confirmation
  );

  return (
    <Card padding="sm" className="mb-4">
      <h3 className="text-lg font-medium text-brand-carbon mb-4">
        {t("createNewUser")}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label={t("email")} required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("enterEmail")}
              required
            />
          </Field>

          <Field label={t("name")}>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("enterName")}
            />
          </Field>

          <Field label={t("role")}>
            <Select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {capitalizeFirstWord(role)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t("password")} required>
            <PasswordInput
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t("enterPassword")}
              required
              minLength={6}
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
              visible={showPassword}
              onVisibleChange={setShowPassword}
            />
          </Field>

          <Field label={t("confirmPassword")} required>
            <Input
              type={showPassword ? "text" : "password"}
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              placeholder={t("confirmPassword")}
              required
              invalid={passwordMismatch}
            />
          </Field>

          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm({ ...form, enabled: e.target.checked })
                }
                className="h-4 w-4 accent-brand-blue"
              />
              <span className="text-sm font-medium text-brand-carbon">
                {t("enabled")}
              </span>
            </label>
          </div>
        </div>

        {passwordMismatch && (
          <p className="text-sm text-danger">{t("passwordsDoNotMatch")}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending || !isValid}
          >
            <Check className="h-4 w-4" />
            {createMutation.isPending ? t("creating") : t("create")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function UsersTable({
  users,
  isLoading,
  metadata,
  filters,
  onFilterChange,
}: UsersTableProps) {
  const t = useT();
  const locale = useLocale();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(
      locale === "es" ? "es-MX" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput || undefined });
  };

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 pb-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchByEmailOrName")}
            controlSize="sm"
            className="w-56"
          />
          <Button type="submit" size="sm">
            {t("search")}
          </Button>
        </form>

        {/* Role Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-brand-carbon/70">
            {t("role")}:
          </span>
          <Chip
            selected={!filters.role}
            onClick={() => onFilterChange({ ...filters, role: undefined })}
          >
            {capitalizeFirstWord(t("all"))}
          </Chip>
          {ROLE_OPTIONS.map((role) => (
            <Chip
              key={role}
              selected={filters.role === role}
              onClick={() => onFilterChange({ ...filters, role })}
            >
              {capitalizeFirstWord(role)}
            </Chip>
          ))}
        </div>

        {/* Enabled Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-brand-carbon/70">
            {t("status")}:
          </span>
          <Chip
            selected={filters.enabled === undefined}
            onClick={() => onFilterChange({ ...filters, enabled: undefined })}
          >
            {capitalizeFirstWord(t("all"))}
          </Chip>
          <Chip
            selected={filters.enabled === true}
            onClick={() => onFilterChange({ ...filters, enabled: true })}
          >
            {t("enabled")}
          </Chip>
          <Chip
            selected={filters.enabled === false}
            onClick={() => onFilterChange({ ...filters, enabled: false })}
          >
            {t("disabled")}
          </Chip>
        </div>

        {/* Create User Button */}
        <div className="ml-auto">
          <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <UserPlus className="h-4 w-4" />
            {t("newUser")}
          </Button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <CreateUserForm onClose={() => setShowCreateForm(false)} />
      )}

      {/* Table */}
      <Card padding="none" className="overflow-visible">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <div>
            <p className="text-sm font-medium text-brand-carbon">
              {metadata?.count ?? 0} {t("users")}
            </p>
          </div>
          {metadata && (
            <div className="text-right text-xs text-brand-gray">
              {t("page")} {metadata.page} {t("of")} {metadata.pages}
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center px-6 py-12 text-brand-gray">
              {t("loadingUsers")}...
            </div>
          ) : users.length ? (
            <div className="divide-y divide-brand-border">
              {users.map((user) => (
                <div key={user.id} className="relative">
                  {/* User Row */}
                  <div
                    className="block px-6 py-4 hover:bg-brand-bg transition-colors cursor-pointer"
                    onClick={() => toggleExpand(user.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-base text-brand-blue truncate">
                            {user.name || t("noName")}
                          </h3>
                          <Badge tone={ROLE_BADGE_TONES[user.role] ?? "neutral"}>
                            {capitalizeFirstWord(user.role)}
                          </Badge>
                          <Badge tone={user.enabled ? "success" : "danger"}>
                            {user.enabled ? t("enabled") : t("disabled")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-brand-carbon/70">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-brand-gray">
                          {t("createdAt")} {formatDate(user.created_at)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-brand-gray hover:text-brand-carbon"
                          title={t("editUser")}
                        >
                          {expandedUserId === user.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Edit Row */}
                  {expandedUserId === user.id && (
                    <UserEditRow
                      user={user}
                      onClose={() => setExpandedUserId(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-brand-gray">
              <p className="font-medium text-brand-carbon">{t("noUsersFound")}</p>
              <p className="text-sm text-brand-gray">{t("noUsersDescription")}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
