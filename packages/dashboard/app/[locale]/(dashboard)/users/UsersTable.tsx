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
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { useUpdateUser, useCreateUser } from "@/src/services/users/queries";

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

const getRoleBadgeColor = (role: UserRole) => {
  const colors: Record<UserRole, string> = {
    admin: "bg-purple-100 text-purple-800",
    staff: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
};

const getEnabledBadgeColor = (enabled: boolean) => {
  return enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
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

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("name")}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t("enterName")}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("role")}
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {capitalizeFirstWord(role)}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("newPassword")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t("leaveBlankToKeep")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password Confirmation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("confirmPassword")}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t("confirmPassword")}
              disabled={!form.password}
            />
          </div>
        </div>

        {/* Enabled Toggle and Actions */}
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              {t("enabled")}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={
                updateMutation.isPending ||
                !!(
                  form.password && form.password !== form.password_confirmation
                )
              }
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              {updateMutation.isPending ? t("saving") : t("save")}
            </button>
          </div>
        </div>

        {form.password && form.password !== form.password_confirmation && (
          <p className="text-sm text-red-600">{t("passwordsDoNotMatch")}</p>
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

  return (
    <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t("createNewUser")}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("email")} *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t("enterEmail")}
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("name")}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t("enterName")}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("role")}
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as UserRole })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {capitalizeFirstWord(role)}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("password")} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t("enterPassword")}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password Confirmation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("confirmPassword")} *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t("confirmPassword")}
              required
            />
          </div>

          {/* Enabled */}
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm({ ...form, enabled: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                {t("enabled")}
              </span>
            </label>
          </div>
        </div>

        {form.password && form.password !== form.password_confirmation && (
          <p className="text-sm text-red-600">{t("passwordsDoNotMatch")}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || !isValid}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            {createMutation.isPending ? t("creating") : t("create")}
          </button>
        </div>
      </form>
    </div>
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
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchByEmailOrName")}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
          >
            {t("search")}
          </button>
        </form>

        {/* Role Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-600">
            {t("role")}:
          </span>
          <button
            onClick={() => onFilterChange({ ...filters, role: undefined })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              !filters.role
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstWord(t("all"))}
          </button>
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              onClick={() => onFilterChange({ ...filters, role })}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                filters.role === role
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {capitalizeFirstWord(role)}
            </button>
          ))}
        </div>

        {/* Enabled Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {t("status")}:
          </span>
          <button
            onClick={() => onFilterChange({ ...filters, enabled: undefined })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.enabled === undefined
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstWord(t("all"))}
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, enabled: true })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.enabled === true
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("enabled")}
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, enabled: false })}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.enabled === false
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("disabled")}
          </button>
        </div>

        {/* Create User Button */}
        <div className="ml-auto">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4" />
            {t("newUser")}
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <CreateUserForm onClose={() => setShowCreateForm(false)} />
      )}

      {/* Table */}
      <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {metadata?.count ?? 0} {t("users")}
            </p>
          </div>
          {metadata && (
            <div className="text-right text-xs text-gray-500">
              {t("page")} {metadata.page} {t("of")} {metadata.pages}
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center px-6 py-12 text-gray-500">
              {t("loadingUsers")}...
            </div>
          ) : users.length ? (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="relative">
                  {/* User Row */}
                  <div
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(user.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-base text-primary truncate">
                            {user.name || t("noName")}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {capitalizeFirstWord(user.role)}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getEnabledBadgeColor(
                              user.enabled
                            )}`}
                          >
                            {user.enabled ? t("enabled") : t("disabled")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-500">
                          {t("createdAt")} {formatDate(user.created_at)}
                        </div>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title={t("editUser")}
                        >
                          {expandedUserId === user.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
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
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="font-medium text-gray-700">{t("noUsersFound")}</p>
              <p className="text-sm text-gray-500">{t("noUsersDescription")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
