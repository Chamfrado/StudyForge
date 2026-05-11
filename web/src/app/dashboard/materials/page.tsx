"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  FileText,
  Loader2,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { Material } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getStatusVariant(status: string) {
  if (status === "READY") return "success";
  if (status === "PROCESSING") return "warning";
  if (status === "FAILED") return "danger";
  return "default";
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadMaterials(options?: { silent?: boolean }) {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await api.getMaterials();

      setMaterials(response.materials);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load materials.";

      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return materials;

    return materials.filter((material) => {
      return (
        material.title.toLowerCase().includes(normalizedSearch) ||
        material.original_filename.toLowerCase().includes(normalizedSearch) ||
        material.file_type.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [materials, search]);

  async function handleDelete(materialId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this material?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(materialId);

      await api.deleteMaterial(materialId);

      setMaterials((current) =>
        current.filter((material) => material.id !== materialId)
      );

      toast.success("Material deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete material.";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">Materials</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Study materials
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Upload files, extract their content and generate AI-powered study
            resources.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => loadMaterials({ silent: true })}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>

          <Link href="/dashboard/materials/upload">
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload material
            </Button>
          </Link>
        </div>
      </section>

      <Card>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Your files
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {materials.length} material{materials.length === 1 ? "" : "s"}{" "}
              uploaded.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search materials..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 md:w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-sm text-slate-500">
                Loading materials...
              </p>
            </div>
          </div>
        ) : filteredMaterials.length ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Material</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredMaterials.map((material) => (
                  <tr key={material.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-medium text-slate-950">
                            {material.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {material.original_filename}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 uppercase text-slate-600">
                      {material.file_type}
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(material.status)}>
                        {material.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(material.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/materials/${material.id}`}>
                          <Button variant="secondary">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(material.id)}
                          disabled={deletingId === material.id}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {deletingId === material.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : materials.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No materials found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try searching for another title, filename or file type.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No materials yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Upload your first material to generate summaries, flashcards and
              quizzes.
            </p>

            <Link href="/dashboard/materials/upload" className="mt-5 inline-flex">
              <Button>Upload material</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}